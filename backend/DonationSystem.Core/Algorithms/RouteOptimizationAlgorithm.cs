using System.Collections.Generic;
using System.Linq;
using DonationSystem.Core.Models.GraphModels;

namespace DonationSystem.Core.Algorithms
{
    public class RouteOptimizationAlgorithm
    {
        private readonly DijkstraAlgorithm _dijkstra;
        private readonly BFSAlgorithm _bfs;

        public RouteOptimizationAlgorithm()
        {
            _dijkstra = new DijkstraAlgorithm();
            _bfs = new BFSAlgorithm();
        }

        public List<GraphNode> OptimizeRoute(
            RouteGraph graph, 
            int startId, 
            List<int> receiverIds,
            int maxStops = 10)
        {
            if (receiverIds.Count == 0)
                return new List<GraphNode> { graph.Nodes[startId] };

            // Find shortest path to each receiver
            var paths = new Dictionary<int, (List<GraphNode> path, double distance)>();
            
            foreach (var receiverId in receiverIds)
            {
                var result = _dijkstra.FindShortestPath(graph, startId, receiverId);
                paths[receiverId] = result;
            }

            // Sort receivers by distance
            var orderedReceivers = paths
                .Where(p => p.Value.distance < double.MaxValue)
                .OrderBy(p => p.Value.distance)
                .Take(maxStops)
                .ToList();

            // Construct optimized route (simple greedy approach)
            var optimizedRoute = new List<GraphNode>();
            var visited = new HashSet<int>();
            var currentId = startId;

            foreach (var receiver in orderedReceivers)
            {
                // Find path from current position to this receiver
                var pathToReceiver = _dijkstra.FindShortestPath(graph, currentId, receiver.Key);
                
                if (pathToReceiver.path.Count > 0)
                {
                    // Add path (skip the first node if it's the same as current position)
                    foreach (var node in pathToReceiver.path)
                    {
                        if (node.Id != currentId || optimizedRoute.Count == 0)
                        {
                            optimizedRoute.Add(node);
                        }
                    }
                    
                    currentId = receiver.Key;
                    visited.Add(receiver.Key);
                }
            }

            return optimizedRoute;
        }

        public double CalculateTotalDistance(List<GraphNode> route)
        {
            if (route.Count < 2)
                return 0;

            double totalDistance = 0;
            for (int i = 0; i < route.Count - 1; i++)
            {
                var currentNode = route[i];
                var nextNode = route[i + 1];
                
                if (currentNode.Neighbors.ContainsKey(nextNode.Id))
                {
                    totalDistance += currentNode.Neighbors[nextNode.Id];
                }
                else
                {
                    // Calculate Euclidean distance as fallback
                    totalDistance += CalculateHaversineDistance(
                        currentNode.Latitude, currentNode.Longitude,
                        nextNode.Latitude, nextNode.Longitude
                    );
                }
            }

            return totalDistance;
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
    }
}