using DonationSystem.Core.Models.Entities;
using DonationSystem.Core.Models.DTOs;
using DonationSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DonationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OfficersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OfficersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Officers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OfficerDto>>> GetOfficers()
        {
            var officers = await _context.Officers
                .Select(o => new OfficerDto
                {
                    OfficerId = o.OfficerId,
                    Name = o.Name,
                    Post = o.Post,
                    OfficeName = o.OfficeName,
                    Address = o.Address,
                    PhoneNumber = o.PhoneNumber,
                    NICNumber = o.NICNumber,
                    Latitude = o.Latitude,
                    Longitude = o.Longitude,
                    CreatedAt = o.CreatedAt
                })
                .ToListAsync();

            return Ok(officers);
        }

        // GET: api/Officers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OfficerDto>> GetOfficer(int id)
        {
            var officer = await _context.Officers
                .Where(o => o.OfficerId == id)
                .Select(o => new OfficerDto
                {
                    OfficerId = o.OfficerId,
                    Name = o.Name,
                    Post = o.Post,
                    OfficeName = o.OfficeName,
                    Address = o.Address,
                    PhoneNumber = o.PhoneNumber,
                    NICNumber = o.NICNumber,
                    Latitude = o.Latitude,
                    Longitude = o.Longitude,
                    CreatedAt = o.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (officer == null)
            {
                return NotFound();
            }

            return officer;
        }

        // POST: api/Officers
        [HttpPost]
        public async Task<ActionResult<Officer>> CreateOfficer([FromBody] CreateOfficerDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Normalize NIC number (trim and uppercase)
            var normalizedNic = createDto.NICNumber?.Trim().ToUpper() ?? string.Empty;

            // Check if NIC already exists (case-insensitive)
            var nicExists = await _context.Officers
                .AnyAsync(o => o.NICNumber.ToUpper() == normalizedNic);
            if (nicExists)
                return BadRequest("An officer with this NIC number already exists");

            var officer = new Officer
            {
                Name = createDto.Name,
                Post = createDto.Post,
                OfficeName = createDto.OfficeName,
                Address = createDto.Address,
                PhoneNumber = createDto.PhoneNumber,
                NICNumber = normalizedNic,
                Latitude = createDto.Latitude,
                Longitude = createDto.Longitude,
                CreatedAt = DateTime.UtcNow
            };

            _context.Officers.Add(officer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOfficer), new { id = officer.OfficerId }, officer);
        }

        // PUT: api/Officers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOfficer(int id, [FromBody] UpdateOfficerDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var officer = await _context.Officers.FindAsync(id);
            if (officer == null)
                return NotFound();

            officer.Name = updateDto.Name;
            officer.Post = updateDto.Post;
            officer.OfficeName = updateDto.OfficeName;
            officer.Address = updateDto.Address;
            officer.PhoneNumber = updateDto.PhoneNumber;

            _context.Officers.Update(officer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Officers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOfficer(int id)
        {
            var officer = await _context.Officers.FindAsync(id);
            if (officer == null)
                return NotFound();

            _context.Officers.Remove(officer);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
