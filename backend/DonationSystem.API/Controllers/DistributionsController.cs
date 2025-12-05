using DonationSystem.Core.Models.Entities;
using DonationSystem.Core.Models.DTOs;
using DonationSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DonationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistributionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DistributionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Distributions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DistributionDto>>> GetDistributions()
        {
            var distributions = await _context.Distributions
                .Include(d => d.Receiver)
                .Include(d => d.Officer)
                .Include(d => d.Item)
                .Select(d => new DistributionDto
                {
                    DistributionId = d.DistributionId,
                    DonationId = d.DonationId,
                    OfficerId = d.OfficerId,
                    ReceiverId = d.ReceiverId,
                    ItemName = d.ItemName,
                    ItemId = d.ItemId,
                    Quantity = d.Quantity,
                    GivenDate = d.GivenDate,
                    Complaint = d.Complaint,
                    OfficerName = d.Officer.Name,
                    ReceiverName = d.Receiver.Name,
                    ItemNameFromItem = d.Item != null ? d.Item.ItemName : null
                })
                .ToListAsync();

            return Ok(distributions);
        }

        // GET: api/Distributions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<DistributionDto>> GetDistribution(int id)
        {
            var distribution = await _context.Distributions
                .Include(d => d.Receiver)
                .Include(d => d.Officer)
                .Include(d => d.Item)
                .Where(d => d.DistributionId == id)
                .Select(d => new DistributionDto
                {
                    DistributionId = d.DistributionId,
                    DonationId = d.DonationId,
                    OfficerId = d.OfficerId,
                    ReceiverId = d.ReceiverId,
                    ItemName = d.ItemName,
                    ItemId = d.ItemId,
                    Quantity = d.Quantity,
                    GivenDate = d.GivenDate,
                    Complaint = d.Complaint,
                    OfficerName = d.Officer.Name,
                    ReceiverName = d.Receiver.Name,
                    ItemNameFromItem = d.Item != null ? d.Item.ItemName : null
                })
                .FirstOrDefaultAsync();

            if (distribution == null)
            {
                return NotFound();
            }

            return distribution;
        }

        // POST: api/Distributions
        [HttpPost]
        public async Task<ActionResult<Distribution>> CreateDistribution([FromBody] CreateDistributionDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Validate Officer exists
            var officerExists = await _context.Officers.AnyAsync(o => o.OfficerId == createDto.OfficerId);
            if (!officerExists)
                return BadRequest("Officer not found");

            // Validate Receiver exists
            var receiverExists = await _context.Receivers.AnyAsync(r => r.ReceiverId == createDto.ReceiverId);
            if (!receiverExists)
                return BadRequest("Receiver not found");

            // Validate Donation if provided
            if (createDto.DonationId.HasValue)
            {
                var donation = await _context.Donations.FindAsync(createDto.DonationId.Value);
                if (donation == null)
                    return BadRequest("Donation not found");

                // Check quantity
                if (donation.Quantity < createDto.Quantity)
                {
                    return BadRequest($"Insufficient quantity. Available: {donation.Quantity}, Requested: {createDto.Quantity}");
                }

                // Decrease quantity
                donation.Quantity -= createDto.Quantity;
                _context.Donations.Update(donation);
            }

            // Validate Item if provided
            if (createDto.ItemId.HasValue)
            {
                var itemExists = await _context.Items.AnyAsync(i => i.ItemId == createDto.ItemId.Value);
                if (!itemExists)
                    return BadRequest("Item not found");
            }

            var distribution = new Distribution
            {
                DonationId = createDto.DonationId,
                OfficerId = createDto.OfficerId,
                ReceiverId = createDto.ReceiverId,
                ItemName = createDto.ItemName,
                ItemId = createDto.ItemId,
                Quantity = createDto.Quantity,
                GivenDate = createDto.GivenDate,
                Complaint = createDto.Complaint
            };

            _context.Distributions.Add(distribution);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDistribution), new { id = distribution.DistributionId }, distribution);
        }

        // PUT: api/Distributions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDistribution(int id, [FromBody] UpdateDistributionDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var distribution = await _context.Distributions.FindAsync(id);
            if (distribution == null)
                return NotFound();

            // Handle inventory update if quantity changes and it's linked to a donation
            if (distribution.DonationId.HasValue && distribution.Quantity != updateDto.Quantity)
            {
                var donation = await _context.Donations.FindAsync(distribution.DonationId.Value);
                if (donation != null)
                {
                    int quantityDifference = updateDto.Quantity - distribution.Quantity;
                    
                    // If increasing quantity, check if enough stock
                    if (quantityDifference > 0 && donation.Quantity < quantityDifference)
                    {
                         return BadRequest($"Insufficient quantity in donation. Available: {donation.Quantity}, Needed additional: {quantityDifference}");
                    }

                    donation.Quantity -= quantityDifference;
                    _context.Donations.Update(donation);
                }
            }

            distribution.ItemName = updateDto.ItemName;
            distribution.Quantity = updateDto.Quantity;
            distribution.Complaint = updateDto.Complaint;

            _context.Distributions.Update(distribution);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Distributions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDistribution(int id)
        {
            var distribution = await _context.Distributions.FindAsync(id);
            if (distribution == null)
                return NotFound();

            // Restore donation quantity if linked
            if (distribution.DonationId.HasValue)
            {
                var donation = await _context.Donations.FindAsync(distribution.DonationId.Value);
                if (donation != null)
                {
                    donation.Quantity += distribution.Quantity;
                    _context.Donations.Update(donation);
                }
            }

            _context.Distributions.Remove(distribution);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
