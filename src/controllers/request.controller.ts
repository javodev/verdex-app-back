import { In } from 'typeorm';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/database';
import { CollectionRequest, RequestStatus } from '../models/CollectionRequest';
import { RequestMaterial } from '../models/RequestMaterial';
import { Address } from '../models/Address';
import { RequestAssignment } from '../models/RequestAssignment';
import { RequestStatusHistory } from '../models/RequestStatusHistory';
import { User } from '../models/User';
import { UserRole } from '../models/User';

export class RequestController {
  private requestRepository = AppDataSource.getRepository(CollectionRequest);
  private materialRepository = AppDataSource.getRepository(RequestMaterial);
  private addressRepository = AppDataSource.getRepository(Address);
  private assignmentRepository = AppDataSource.getRepository(RequestAssignment);
  private historyRepository = AppDataSource.getRepository(RequestStatusHistory);
  private userRepository = AppDataSource.getRepository(User);

  createRequest = async (req: AuthRequest, res: Response) => {
    try {
      const { address_id, estimated_weight, comments, materials } = req.body;
      const citizenId = req.user!.userId;

      // Verificar que la dirección pertenezca al ciudadano
      const address = await this.addressRepository.findOne({
        where: { id: address_id, userId: citizenId }
      });

      if (!address) {
        return res.status(404).json({ message: 'Dirección no encontrada' });
      }

      // Crear la solicitud
      const request = this.requestRepository.create({
        citizenId,
        addressId: address_id,
        estimatedWeight: estimated_weight,
        comments,
        status: RequestStatus.PENDING
      });

      const savedRequest = await this.requestRepository.save(request);

      // Guardar materiales
      if (materials && materials.length > 0) {
        const requestMaterials = materials.map((material: any) => {
          return this.materialRepository.create({
            requestId: savedRequest.id,
            materialId: material.material_id,
            quantity: material.quantity
          });
        });
        await this.materialRepository.save(requestMaterials);
      }

      // Registrar historial - oldStatus = null para el primer estado
      const history = new RequestStatusHistory();
      history.requestId = savedRequest.id;
      history.oldStatus = null;  // Primer estado, no hay estado anterior
      history.newStatus = RequestStatus.PENDING;  // Estado inicial
      history.changedBy = citizenId;
      await this.historyRepository.save(history);

      res.status(201).json({
        message: 'Solicitud creada exitosamente',
        request: savedRequest
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al crear solicitud' });
    }
  };

  getRequests = async (req: AuthRequest, res: Response) => {
    try {
      const { role } = req.user!;
      const userId = req.user!.userId;

      let whereConditions: any = {};

      // Filtrar según el rol
      if (role === 'CITIZEN') {
        whereConditions.citizenId = userId;
      } else if (role === 'COLLECTOR') {
        // Para recolector, obtener solicitudes asignadas
        const assignments = await this.assignmentRepository.find({
          where: { collectorId: userId },
          select: ['requestId']
        });
        
        const requestIds = assignments.map(a => a.requestId);
        
        if (requestIds.length > 0) {
          // CORRECCIÓN: Usar TypeORM In() en lugar de { $in: ... }
          whereConditions.id = In(requestIds);
        } else {
          return res.json([]);
        }
      }

      // Filtro por estado
      if (req.query.status) {
        whereConditions.status = req.query.status;
      }

      const requests = await this.requestRepository.find({
        where: whereConditions,
        relations: ['address', 'citizen', 'materials', 'materials.material', 'assignments', 'assignments.collector'],
        order: { requestDate: 'DESC' }
      });

      // Formatear respuesta
      const formattedRequests = requests.map(request => {
        const latestAssignment = request.assignments && request.assignments.length > 0 
          ? request.assignments[0] 
          : null;
        
        const collector = latestAssignment?.collector;

        return {
          id: request.id,
          request_date: request.requestDate,
          estimated_weight: request.estimatedWeight,
          comments: request.comments,
          status: request.status,
          citizen_name: request.citizen?.fullName,
          citizen_phone: request.citizen?.phone,
          citizen_email: request.citizen?.email,
          address: request.address ? {
            address_text: request.address.addressText,
            alias: request.address.alias,
            latitude: request.address.latitude,
            longitude: request.address.longitude
          } : null,
          materials: request.materials?.map(m => ({
            material_id: m.materialId,
            material_name: m.material?.name,
            quantity: m.quantity
          })),
          collector: collector ? {
            id: collector.id,
            full_name: collector.fullName,
            phone: collector.phone,
            email: collector.email,
            vehicle_type: collector.vehicleType,
            assigned_zone: collector.assignedZone
          } : null
        };
      });

      res.json(formattedRequests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener solicitudes' });
    }
  };

  getRequestById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const role = req.user!.role;

      const request = await this.requestRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['address', 'citizen', 'materials', 'materials.material', 'assignments', 'assignments.collector']
      });

      if (!request) {
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }

      // Verificar permisos
      if (role === 'CITIZEN' && request.citizenId !== userId) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      res.json(request);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener solicitud' });
    }
  };

  assignRequest = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { collector_id } = req.body;
      const operatorId = req.user!.userId;

      // Verificar que el recolector existe
      const collector = await this.userRepository.findOne({
        where: { 
            id: collector_id, 
            role: UserRole.COLLECTOR, 
            active: true 
          }
      });

      if (!collector) {
        return res.status(404).json({ message: 'Recolector no encontrado' });
      }

      // Verificar que la solicitud existe y está pendiente
      const request = await this.requestRepository.findOne({
        where: { id: parseInt(id), status: RequestStatus.PENDING }
      });

      if (!request) {
        return res.status(404).json({ message: 'Solicitud no encontrada o ya asignada' });
      }

      // Crear asignación
      const assignment = this.assignmentRepository.create({
        requestId: request.id,
        collectorId: collector_id
      });
      await this.assignmentRepository.save(assignment);

      // Actualizar estado de la solicitud
      request.status = RequestStatus.ASSIGNED;
      await this.requestRepository.save(request);

      // Registrar historial
      const history = this.historyRepository.create({
        requestId: request.id,
        oldStatus: RequestStatus.PENDING,
        newStatus: RequestStatus.ASSIGNED,
        changedBy: operatorId
      });
      await this.historyRepository.save(history);

      res.json({
        message: 'Solicitud asignada exitosamente',
        assignment
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al asignar solicitud' });
    }
  };

  updateRequestStatus = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.userId;
      const role = req.user!.role;

      const request = await this.requestRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!request) {
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }

      // Verificar permisos según el rol
      if (role === 'CITIZEN' && request.citizenId !== userId) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      const oldStatus = request.status;
      request.status = status;
      await this.requestRepository.save(request);

      // Registrar historial
      const history = this.historyRepository.create({
        requestId: request.id,
        oldStatus,
        newStatus: status,
        changedBy: userId
      });
      await this.historyRepository.save(history);

      res.json({
        message: 'Estado actualizado exitosamente',
        request
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar estado' });
    }
  };
}