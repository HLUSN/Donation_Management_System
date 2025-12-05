using System.Collections.Generic;
using System.Linq;
using DonationSystem.Core.Models.GraphModels;

namespace DonationSystem.Core.Algorithms
{
    public class BFSAlgorithm
    {
        public List<List<GraphNode>> FindAllPaths(RouteGraph graph, int startId, int maxDepth)
        {
            var allPaths = new List<List<GraphNode>>();
            var queue = new Queue<List<GraphNode>>();
            
            var startNode = graph.Nodes[startId];
            queue.Enqueue(new List<GraphNode> { startNode });

            while (queue.Count > 0)
            {
                var currentPath = queue.Dequeue();
                var currentNode = currentPath.Last();

                // Add current path to results if it has more than 1 node
                if (currentPath.Count > 1)
                {
                    allPaths.Add(new List<GraphNode>(currentPath));
                }

                // Stop if we've reached max depth
                if (currentPath.Count >= maxDepth)
                    continue;

                // Explore neighbors
                foreach (var edge in graph.GetNeighbors(currentNode.Id))
                {
                    if (!graph.Nodes.ContainsKey(edge.TargetId))
                        continue;

                    var neighbor = graph.Nodes[edge.TargetId];
                    
                    // Avoid cycles
                    if (!currentPath.Any(n => n.Id == neighbor.Id))
                    {
                        var newPath = new List<GraphNode>(currentPath) { neighbor };
                        queue.Enqueue(newPath);
                    }
                }
            }

            return allPaths;
        }

        public List<GraphNode> FindNearestReceivers(RouteGraph graph, int officerId, int count)
        {
            var visited = new HashSet<int>();
            var queue = new Queue<GraphNode>();
            var nearestReceivers = new List<GraphNode>();

            var startNode = graph.Nodes[officerId];
            queue.Enqueue(startNode);
            visited.Add(startNode.Id);

            while (queue.Count > 0 && nearestReceivers.Count < count)
            {
                var currentNode = queue.Dequeue();

                // If this is a receiver (not the starting officer), add to results
                if (currentNode.Id != officerId && currentNode.Type == NodeType.Receiver)
                {
                    nearestReceivers.Add(currentNode);
                }

                // Explore neighbors
                foreach (var edge in graph.GetNeighbors(currentNode.Id))
                {
                    if (!visited.Contains(edge.TargetId))
                    {
                        visited.Add(edge.TargetId);
                        queue.Enqueue(graph.Nodes[edge.TargetId]);
                    }
                }
            }

            return nearestReceivers;
        }
    }
}