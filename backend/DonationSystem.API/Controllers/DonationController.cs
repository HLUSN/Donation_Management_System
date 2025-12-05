using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using DonationSystem.Core.Models.DTOs;
using DonationSystem.Infrastructure.Data;
using DonationSystem.Core.Models.Entities;

namespace DonationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DonationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDonations()
        {
            var donations = await _context.Donations
                .Include(d => d.Officer)
                .Include(d => d.Donor)
                .Select(d => new DonationDto
                {
                    DonationId = d.DonationId,
                    ItemName = d.ItemName,
                    Quantity = d.Quantity,
                    OfficerId = d.OfficerId,
                    DonorId = d.DonorId,
                    DonatedDate = d.DonatedDate,
                    ExpiryDate = d.ExpiryDate,
                    OfficerName = d.Officer.Name,
                    DonorName = d.Donor.Name
                })
                .ToListAsync();

            return Ok(donations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDonationById(int id)
        {
            var donation = await _context.Donations
                .Include(d => d.Officer)
                .Include(d => d.Donor)
                .FirstOrDefaultAsync(d => d.DonationId == id);

            if (donation == null)
                return NotFound();

            var donationDto = new DonationDto
            {
                DonationId = donation.DonationId,
                ItemName = donation.ItemName,
                Quantity = donation.Quantity,
                OfficerId = donation.OfficerId,
                DonorId = donation.DonorId,
                DonatedDate = donation.DonatedDate,
                ExpiryDate = donation.ExpiryDate,
                OfficerName = donation.Officer.Name,
                DonorName = donation.Donor.Name
            };

            return Ok(donationDto);
        }

        [HttpGet("details/{id}")]
        public async Task<ActionResult<Donation>> GetDonation(int id)
        {
            var donation = await _context.Donations
                .Include(d => d.Donor)
                .Include(d => d.Items)
                .FirstOrDefaultAsync(d => d.DonationId == id);

            if (donation == null)
            {
                return NotFound();
            }

            return donation;
        }

        [HttpPost]
        public async Task<IActionResult> CreateDonation([FromBody] CreateDonationDto createDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { message = "Validation failed", errors });
            }

            // Check if officer exists
            var officerExists = await _context.Officers.AnyAsync(o => o.OfficerId == createDto.OfficerId);
            if (!officerExists)
                return BadRequest("Officer not found");

            int donorId;

            // Check if we're creating a new donor or using existing
            if (createDto.NewDonor != null)
            {
                // Create new donor
                var nicExists = await _context.Donors.AnyAsync(d => d.NICNumber == createDto.NewDonor.NICNumber);
                if (nicExists)
                    return BadRequest("A donor with this NIC number already exists");

                var newDonor = new Donor
                {
                    NICNumber = createDto.NewDonor.NICNumber,
                    Name = createDto.NewDonor.Name,
                    PhoneNumber = createDto.NewDonor.PhoneNumber,
                    Address = createDto.NewDonor.Address,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Donors.Add(newDonor);
                await _context.SaveChangesAsync();
                donorId = newDonor.DonorId;
            }
            else if (createDto.DonorId.HasValue)
            {
                // Use existing donor
                var donorExists = await _context.Donors.AnyAsync(d => d.DonorId == createDto.DonorId.Value);
                if (!donorExists)
                    return BadRequest("Donor not found");
                donorId = createDto.DonorId.Value;
            }
            else
            {
                return BadRequest("Either DonorId or NewDonor must be provided");
            }

            var donation = new Donation
            {
                ItemName = createDto.ItemName,
                Quantity = createDto.Quantity,
                OfficerId = createDto.OfficerId,
                DonorId = donorId,
                DonatedDate = createDto.DonatedDate,
                ExpiryDate = createDto.ExpiryDate
            };

            _context.Donations.Add(donation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDonationById), new { id = donation.DonationId }, donation);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDonation(int id, [FromBody] UpdateDonationDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var donation = await _context.Donations.FindAsync(id);
            if (donation == null)
                return NotFound();

            donation.ItemName = updateDto.ItemName;
            donation.Quantity = updateDto.Quantity;
            donation.ExpiryDate = updateDto.ExpiryDate;

            _context.Donations.Update(donation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDonation(int id)
        {
            var donation = await _context.Donations.FindAsync(id);
            if (donation == null)
                return NotFound();

            _context.Donations.Remove(donation);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}