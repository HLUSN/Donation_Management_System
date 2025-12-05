using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using DonationSystem.Core.Models.DTOs;
using DonationSystem.Core.Models.Entities;
using DonationSystem.Infrastructure.Services;
using DonationSystem.Infrastructure.Data;

namespace DonationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RouteOptimizationController : ControllerBase
    {
        private readonly IRouteOptimizationService _routeService;
        private readonly ApplicationDbContext _context;

        public RouteOptimizationController(IRouteOptimizationService routeService, ApplicationDbContext context)
        {
            _routeService = routeService;
            _context = context;
        }

        [HttpPost("optimize")]
        public async Task<IActionResult> OptimizeRoute([FromBody] RouteRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest("Request cannot be null");

                if (request.ReceiverIds == null || request.ReceiverIds.Count == 0)
                    return BadRequest("At least one receiver is required");

                var optimalRoute = await _routeService.CalculateOptimalRoute(request);
                
                // Save routes to database
                var routesToSave = new List<DonationSystem.Core.Models.Entities.Route>();
                var officerId = request.StartOfficerId;
                
                // Get distributions for the selected receivers
                var distributions = await _context.Distributions
                    .Where(d => request.ReceiverIds.Contains(d.ReceiverId))
                    .ToListAsync();
                
                // Create route records for each path segment
                for (int i = 0; i < optimalRoute.Path.Count; i++)
                {
                    var currentPoint = optimalRoute.Path[i];
                    
                    // Skip the starting officer node
                    if (i == 0 || currentPoint.Type == "officer")
                        continue;
                    
                    // Find the distribution for this receiver
                    var distribution = distributions.FirstOrDefault(d => d.ReceiverId == currentPoint.Id);
                    
                    if (distribution != null)
                    {
                        // Calculate distance from previous point
                        var previousPoint = optimalRoute.Path[i - 1];
                        var distance = CalculateDistance(
                            previousPoint.Latitude, previousPoint.Longitude,
                            currentPoint.Latitude, currentPoint.Longitude);
                        
                        var route = new DonationSystem.Core.Models.Entities.Route
                        {
                            DistributionId = distribution.DistributionId,
                            FromOfficerId = officerId,
                            ToReceiverId = currentPoint.Id,
                            Distance = (decimal)distance,
                            Timestamp = DateTime.UtcNow
                        };
                        
                        routesToSave.Add(route);
                    }
                }
                
                if (routesToSave.Count > 0)
                {
                    _context.Routes.AddRange(routesToSave);
                    await _context.SaveChangesAsync();
                }
                
                return Ok(optimalRoute);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in km
            var dLat = (lat2 - lat1) * Math.PI / 180.0;
            var dLon = (lon2 - lon1) * Math.PI / 180.0;
            
            var a = Math.Sin(dLat/2) * Math.Sin(dLat/2) +
                    Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                    Math.Sin(dLon/2) * Math.Sin(dLon/2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1-a));
            return R * c;
        }

        [HttpGet("nearest/{officerId}")]
        public async Task<IActionResult> FindNearestReceivers(int officerId, [FromQuery] int count = 5)
        {
            try
            {
                if (count <= 0 || count > 20)
                    return BadRequest("Count must be between 1 and 20");

                var nearestReceivers = await _routeService.FindNearestReceivers(officerId, count);
                return Ok(nearestReceivers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("graph")]
        public async Task<IActionResult> GetGraph()
        {
            try
            {
                var graph = await _routeService.BuildGraphFromDatabase();
                
                // Return simplified graph structure
                var response = new
                {
                    Nodes = graph.Nodes.Values.Select(n => new
                    {
                        n.Id,
                        n.Name,
                        n.Type,
                        n.Latitude,
                        n.Longitude,
                        NeighborCount = n.Neighbors.Count
                    }),
                    TotalNodes = graph.Nodes.Count,
                    TotalEdges = graph.AdjacencyList.Sum(a => a.Value.Count) / 2 // Divided by 2 for bidirectional
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}