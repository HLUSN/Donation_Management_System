using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonationSystem.Core.Models.Entities;
using DonationSystem.Infrastructure.Data;

namespace DonationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RouteController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RouteController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetRoutes()
        {
            var routes = await _context.Routes
                .Include(r => r.Distribution)
                .Include(r => r.FromOfficer)
                .Include(r => r.ToReceiver)
                .OrderByDescending(r => r.Timestamp)
                .ToListAsync();

            return Ok(routes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRouteById(int id)
        {
            var route = await _context.Routes
                .Include(r => r.Distribution)
                .Include(r => r.FromOfficer)
                .Include(r => r.ToReceiver)
                .FirstOrDefaultAsync(r => r.RouteId == id);

            if (route == null)
                return NotFound();

            return Ok(route);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRoute([FromBody] CreateRouteDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var route = new DonationSystem.Core.Models.Entities.Route
            {
                DistributionId = createDto.DistributionId,
                FromOfficerId = createDto.FromOfficerId,
                ToReceiverId = createDto.ToReceiverId,
                Distance = (decimal)createDto.Distance,
                Timestamp = DateTime.UtcNow
            };

            _context.Routes.Add(route);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRouteById), new { id = route.RouteId }, route);
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> CreateRoutes([FromBody] List<CreateRouteDto> createDtos)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var routes = createDtos.Select(dto => new DonationSystem.Core.Models.Entities.Route
            {
                DistributionId = dto.DistributionId,
                FromOfficerId = dto.FromOfficerId,
                ToReceiverId = dto.ToReceiverId,
                Distance = (decimal)dto.Distance,
                Timestamp = DateTime.UtcNow
            }).ToList();

            _context.Routes.AddRange(routes);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"{routes.Count} routes created successfully", routes });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoute(int id)
        {
            var route = await _context.Routes.FindAsync(id);
            if (route == null)
                return NotFound();

            _context.Routes.Remove(route);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateRouteDto
    {
        public int DistributionId { get; set; }
        public int FromOfficerId { get; set; }
        public int ToReceiverId { get; set; }
        public float Distance { get; set; }
    }
}
