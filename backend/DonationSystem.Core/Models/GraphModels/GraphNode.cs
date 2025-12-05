namespace DonationSystem.Core.Models.GraphModels
{
    public enum NodeType
    {
        Officer,
        Receiver
    }

    public class GraphNode
    {
        public int Id { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public NodeType Type { get; set; }
        public string Name { get; set; } = string.Empty;
        
        // For Dijkstra's algorithm
        public double Distance { get; set; } = double.MaxValue;
        public GraphNode? Previous { get; set; }
        public bool Visited { get; set; }
        
        // Adjacency list: neighborId -> distance
        public Dictionary<int, double> Neighbors { get; set; } = new Dictionary<int, double>();

        public GraphNode(int id, double lat, double lng, NodeType type, string name)
        {
            Id = id;
            Latitude = lat;
            Longitude = lng;
            Type = type;
            Name = name;
        }

        public void AddNeighbor(int neighborId, double distance)
        {
            if (!Neighbors.ContainsKey(neighborId))
            {
                Neighbors[neighborId] = distance;
            }
        }
    }

    public class Edge
    {
        public int TargetId { get; set; }
        public double Weight { get; set; }

        public Edge(int targetId, double weight)
        {
            TargetId = targetId;
            Weight = weight;
        }
    }

    public class RouteGraph
    {
        public Dictionary<int, GraphNode> Nodes { get; set; }
        public Dictionary<int, List<Edge>> AdjacencyList { get; set; }

        public RouteGraph()
        {
            Nodes = new Dictionary<int, GraphNode>();
            AdjacencyList = new Dictionary<int, List<Edge>>();
        }

        public void AddNode(GraphNode node)
        {
            Nodes[node.Id] = node;
            AdjacencyList[node.Id] = new List<Edge>();
        }

        public void AddEdge(int fromId, int toId, double weight, bool bidirectional = true)
        {
            if (!AdjacencyList.ContainsKey(fromId))
                AdjacencyList[fromId] = new List<Edge>();

            AdjacencyList[fromId].Add(new Edge(toId, weight));

            if (bidirectional)
            {
                if (!AdjacencyList.ContainsKey(toId))
                    AdjacencyList[toId] = new List<Edge>();

                AdjacencyList[toId].Add(new Edge(fromId, weight));
            }
        }

        public List<Edge> GetNeighbors(int nodeId)
        {
            return AdjacencyList.ContainsKey(nodeId) ? AdjacencyList[nodeId] : new List<Edge>();
        }

        public IEnumerable<int> GetNodeIds()
        {
            return Nodes.Keys;
        }
    }
}