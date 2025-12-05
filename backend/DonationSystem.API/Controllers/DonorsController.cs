using DonationSystem.Core.Models.Entities;
using DonationSystem.Core.Models.DTOs;
using DonationSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DonationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DonorsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Donors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonorDto>>> GetDonors()
        {
            var donors = await _context.Donors
                .Select(d => new DonorDto
                {
                    DonorId = d.DonorId,
                    NICNumber = d.NICNumber,
                    Name = d.Name,
                    PhoneNumber = d.PhoneNumber,
                    Address = d.Address,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();

            return Ok(donors);
        }

        // GET: api/Donors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DonorDto>> GetDonor(int id)
        {
            var donor = await _context.Donors
                .Where(d => d.DonorId == id)
                .Select(d => new DonorDto
                {
                    DonorId = d.DonorId,
                    NICNumber = d.NICNumber,
                    Name = d.Name,
                    PhoneNumber = d.PhoneNumber,
                    Address = d.Address,
                    CreatedAt = d.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (donor == null)
            {
                return NotFound();
            }

            return donor;
        }

        // POST: api/Donors
        [HttpPost]
        public async Task<ActionResult<Donor>> CreateDonor([FromBody] CreateDonorDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if NIC already exists
            var nicExists = await _context.Donors.AnyAsync(d => d.NICNumber == createDto.NICNumber);
            if (nicExists)
                return BadRequest("A donor with this NIC number already exists");

            var donor = new Donor
            {
                NICNumber = createDto.NICNumber,
                Name = createDto.Name,
                PhoneNumber = createDto.PhoneNumber,
                Address = createDto.Address,
                CreatedAt = DateTime.UtcNow
            };

            _context.Donors.Add(donor);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDonor), new { id = donor.DonorId }, donor);
        }

        // PUT: api/Donors/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDonor(int id, [FromBody] UpdateDonorDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var donor = await _context.Donors.FindAsync(id);
            if (donor == null)
                return NotFound();

            donor.Name = updateDto.Name;
            donor.PhoneNumber = updateDto.PhoneNumber;
            donor.Address = updateDto.Address;

            _context.Donors.Update(donor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Donors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDonor(int id)
        {
            var donor = await _context.Donors.FindAsync(id);
            if (donor == null)
                return NotFound();

            _context.Donors.Remove(donor);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
