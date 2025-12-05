using System.Collections.Generic;
using DonationSystem.Core.Models.GraphModels;

namespace DonationSystem.Core.Algorithms
{
    public class DijkstraAlgorithm
    {
        public (List<GraphNode> path, double distance) FindShortestPath(
            RouteGraph graph, int startId, int endId)
        {
            // Reset all nodes
            foreach (var node in graph.Nodes.Values)
            {
                node.Distance = double.MaxValue;
                node.Previous = null;
                node.Visited = false;
            }

            // Priority queue simulation using SortedDictionary
            var unvisitedNodes = new SortedDictionary<double, List<GraphNode>>();
            
            var startNode = graph.Nodes[startId];
            startNode.Distance = 0;
            AddToUnvisited(unvisitedNodes, startNode);

            while (unvisitedNodes.Count > 0)
            {
                // Get node with smallest distance
                var current = GetClosestUnvisitedNode(unvisitedNodes);
                
                if (current == null || current.Id == endId)
                    break;

                current.Visited = true;

                // Check all neighbors
                foreach (var edge in graph.GetNeighbors(current.Id))
                {
                    if (!graph.Nodes.ContainsKey(edge.TargetId))
                        continue;

                    var neighbor = graph.Nodes[edge.TargetId];
                    
                    if (neighbor.Visited)
                        continue;

                    double newDistance = current.Distance + edge.Weight;
                    
                    if (newDistance < neighbor.Distance)
                    {
                        // Remove from old position in unvisited
                        RemoveFromUnvisited(unvisitedNodes, neighbor);
                        
                        neighbor.Distance = newDistance;
                        neighbor.Previous = current;
                        
                        // Add to new position in unvisited
                        AddToUnvisited(unvisitedNodes, neighbor);
                    }
                }
            }

            // Reconstruct path
            var path = new List<GraphNode>();
            var endNode = graph.Nodes.ContainsKey(endId) ? graph.Nodes[endId] : null;
            
            if (endNode == null || endNode.Distance == double.MaxValue)
                return (path, double.MaxValue);

            // Backtrack from end to start
            var currentNode = endNode;
            while (currentNode != null)
            {
                path.Insert(0, currentNode);
                currentNode = currentNode.Previous;
            }

            return (path, endNode.Distance);
        }

        private void AddToUnvisited(SortedDictionary<double, List<GraphNode>> unvisitedNodes, GraphNode node)
        {
            if (!unvisitedNodes.ContainsKey(node.Distance))
                unvisitedNodes[node.Distance] = new List<GraphNode>();
            
            unvisitedNodes[node.Distance].Add(node);
        }

        private void RemoveFromUnvisited(SortedDictionary<double, List<GraphNode>> unvisitedNodes, GraphNode node)
        {
            if (unvisitedNodes.ContainsKey(node.Distance))
            {
                unvisitedNodes[node.Distance].Remove(node);
                if (unvisitedNodes[node.Distance].Count == 0)
                    unvisitedNodes.Remove(node.Distance);
            }
        }

        private GraphNode? GetClosestUnvisitedNode(SortedDictionary<double, List<GraphNode>> unvisitedNodes)
        {
            if (unvisitedNodes.Count == 0)
                return null;

            var firstKey = unvisitedNodes.Keys.GetEnumerator().Current;
            var nodesAtDistance = unvisitedNodes[firstKey];
            
            if (nodesAtDistance.Count == 0)
                return null;

            var node = nodesAtDistance[0];
            nodesAtDistance.RemoveAt(0);
            
            if (nodesAtDistance.Count == 0)
                unvisitedNodes.Remove(firstKey);
            
            return node;
        }
    }
}