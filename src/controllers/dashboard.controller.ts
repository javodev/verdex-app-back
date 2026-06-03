import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/database';
import { CollectionRequest, RequestStatus } from '../models/CollectionRequest';
import { User, UserRole } from '../models/User';

export class DashboardController {
  private requestRepository = AppDataSource.getRepository(CollectionRequest);
  private userRepository = AppDataSource.getRepository(User);

  getStats = async (req: AuthRequest, res: Response) => {
    try {
      // Total de solicitudes
      const totalRequests = await this.requestRepository.count();
      
      // Solicitudes completadas
      const completedRequests = await this.requestRepository.count({
        where: { status: RequestStatus.COMPLETED }
      });
      
      // Solicitudes pendientes
      const pendingRequests = await this.requestRepository.count({
        where: { status: RequestStatus.PENDING }
      });
      
      // Solicitudes en progreso
      const inProgressRequests = await this.requestRepository.count({
        where: { status: RequestStatus.IN_PROGRESS }
      });
      
      // Total de recolectores activos
      const totalCollectors = await this.userRepository.count({
        where: { role: UserRole.COLLECTOR, active: true }
      });
      
      // Total de ciudadanos registrados
      const totalCitizens = await this.userRepository.count({
        where: { role: UserRole.CITIZEN, active: true }
      });
      
      // Recaudación total estimada (kg recolectados)
      const completedRequestsList = await this.requestRepository.find({
        where: { status: RequestStatus.COMPLETED },
        select: ['estimatedWeight']
      });
      
      const totalKgRecolected = completedRequestsList.reduce(
        (sum, request) => sum + (request.estimatedWeight || 0), 
        0
      );

      res.json({
        total_requests: totalRequests,
        completed_requests: completedRequests,
        pending_requests: pendingRequests,
        in_progress_requests: inProgressRequests,
        total_collectors: totalCollectors,
        total_citizens: totalCitizens,
        total_kg_recolected: totalKgRecolected
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  };

  getCollectorStats = async (req: AuthRequest, res: Response) => {
  try {
    const collectorId = req.user!.userId;

    // Obtener todas las asignaciones del recolector
    const assignments = await this.requestRepository
      .createQueryBuilder('request')
      .innerJoin('request.assignments', 'assignment')
      .where('assignment.collectorId = :collectorId', { collectorId })
      .select(['request.id', 'request.status'])
      .getMany();

    // Contar por estado
    let assignedTotal = 0;
    let inProgressTotal = 0;
    let completedTotal = 0;

    assignments.forEach(request => {
      switch (request.status) {
        case RequestStatus.ASSIGNED:
          assignedTotal++;
          break;
        case RequestStatus.IN_PROGRESS:
          inProgressTotal++;
          break;
        case RequestStatus.COMPLETED:
          completedTotal++;
          break;
      }
    });

    res.json({
      assigned_total: assignedTotal,
      in_progress: inProgressTotal,
      completed: completedTotal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas del recolector' });
  }
};
}