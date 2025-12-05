using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DonationSystem.Core.Models.DTOs;
using DonationSystem.Core.Models.GraphModels;
using DonationSystem.Core.Algorithms;
using DonationSystem.Infrastructure.Data;

namespace DonationSystem.Infrastructure.Services
{
    public interface IRouteOptimizationService
    {
        Task<RouteResponseDto> CalculateOptimalRoute(RouteRequestDto request);
        Task<List<RoutePointDto>> FindNearestReceivers(int officerId, int count);
        Task<RouteGraph> BuildGraphFromDatabase();
    }

    public class RouteOptimizationService : IRouteOptimizationService
    {
        private readonly ApplicationDbContext _context;
        private readonly RouteOptimizationAlgorithm _algorithm;

        public RouteOptimizationService(ApplicationDbContext context)
        {
            _context = context;
            _algorithm = new RouteOptimizationAlgorithm();
        }

        public async Task<RouteResponseDto> CalculateOptimalRoute(RouteRequestDto request)
        {
            // Build graph from database
            var graph = await BuildGraphFromDatabase();
            
            // Optimize route
            var optimizedNodes = _algorithm.OptimizeRoute(
                graph, 
                request.StartOfficerId, 
                request.ReceiverIds,
                request.Constraints.MaxStops
            );

            // Calculate total distance
            var totalDistance = _algorithm.CalculateTotalDistance(optimizedNodes);

            // Convert to DTO
            var response = new RouteResponseDto
            {
                TotalDistance = totalDistance,
                EstimatedTime = totalDistance * 2, // Assuming 30 km/h average speed
                FuelCost = totalDistance * 0.15, // Assuming $0.15 per km
                Path = optimizedNodes.Select(node => new RoutePointDto
                {
                    Id = node.Id,
                    Name = node.Name,
                    Latitude = node.Latitude,
                    Longitude = node.Longitude,
                    Type = node.Type.ToString()
                }).ToList()
            };

            // Generate simple directions
            response.Directions = GenerateDirections(response.Path);

            return response;
        }

        public async Task<List<RoutePointDto>> FindNearestReceivers(int officerId, int count)
        {
            var graph = await BuildGraphFromDatabase();
            var bfs = new BFSAlgorithm();
            
            var nearestNodes = bfs.FindNearestReceivers(graph, officerId, count);
            
            return nearestNodes.Select(node => new RoutePointDto
            {
                Id = node.Id,
                Name = node.Name,
                Latitude = node.Latitude,
                Longitude = node.Longitude,
                Type = node.Type.ToString()
            }).ToList();
        }

        public async Task<RouteGraph> BuildGraphFromDatabase()
        {
            var graph = new RouteGraph();

            // Add officers as nodes
            var officers = await _context.Officers
                .Where(o => o.Latitude != null && o.Longitude != null)
                .ToListAsync();

            foreach (var officer in officers)
            {
                var node = new GraphNode(
                    officer.OfficerId,
                    (double)officer.Latitude!,
                    (double)officer.Longitude!,
                    NodeType.Officer,
                    officer.Name
                );
                graph.AddNode(node);
            }

            // Add receivers as nodes
            var receivers = await _context.Receivers.ToListAsync();
            foreach (var receiver in receivers)
            {
                var node = new GraphNode(
                    receiver.ReceiverId,
                    (double)receiver.Latitude,
                    (double)receiver.Longitude,
                    NodeType.Receiver,
                    receiver.Name
                );
                graph.AddNode(node);
            }

            // Add edges between nearby nodes (within 50 km)
            foreach (var node1 in graph.Nodes.Values)
            {
                foreach (var node2 in graph.Nodes.Values)
                {
                    if (node1.Id != node2.Id)
                    {
                        var distance = CalculateHaversineDistance(
                            node1.Latitude, node1.Longitude,
                            node2.Latitude, node2.Longitude
                        );

                        // Add edge if nodes are within 50 km of each other
                        if (distance <= 50)
                        {
                            graph.AddEdge(node1.Id, node2.Id, distance);
                            node1.AddNeighbor(node2.Id, distance);
                            node2.AddNeighbor(node1.Id, distance);
                        }
                    }
                }
            }

            return graph;
        }

        private double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in kilometers
            
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            
            return R * c;
        }

        private double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }

        private List<string> GenerateDirections(List<RoutePointDto> path)
        {
            var directions = new List<string>();
            
            for (int i = 0; i < path.Count - 1; i++)
            {
                var from = path[i];
                var to = path[i + 1];
                
                directions.Add($"From {from.Name} to {to.Name}");
            }
            
            return directions;
        }
    }
}