using DonationSystem.Core.Models.Entities;
using DonationSystem.Core.Models.DTOs;
using DonationSystem.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DonationSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceiversController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReceiversController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Receivers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReceiverDto>>> GetReceivers()
        {
            var receivers = await _context.Receivers
                .Select(r => new ReceiverDto
                {
                    ReceiverId = r.ReceiverId,
                    Name = r.Name,
                    Latitude = r.Latitude,
                    Longitude = r.Longitude,
                    Address = r.Address,
                    Priority = r.Priority,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(receivers);
        }

        // GET: api/Receivers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ReceiverDto>> GetReceiver(int id)
        {
            var receiver = await _context.Receivers
                .Where(r => r.ReceiverId == id)
                .Select(r => new ReceiverDto
                {
                    ReceiverId = r.ReceiverId,
                    Name = r.Name,
                    Latitude = r.Latitude,
                    Longitude = r.Longitude,
                    Address = r.Address,
                    Priority = r.Priority,
                    CreatedAt = r.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (receiver == null)
            {
                return NotFound();
            }

            return receiver;
        }

        // POST: api/Receivers
        [HttpPost]
        public async Task<ActionResult<Receiver>> CreateReceiver([FromBody] CreateReceiverDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var receiver = new Receiver
            {
                Name = createDto.Name,
                Latitude = createDto.Latitude,
                Longitude = createDto.Longitude,
                Address = createDto.Address,
                Priority = createDto.Priority,
                CreatedAt = DateTime.UtcNow
            };

            _context.Receivers.Add(receiver);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReceiver), new { id = receiver.ReceiverId }, receiver);
        }

        // PUT: api/Receivers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReceiver(int id, [FromBody] UpdateReceiverDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var receiver = await _context.Receivers.FindAsync(id);
            if (receiver == null)
                return NotFound();

            receiver.Name = updateDto.Name;
            receiver.Address = updateDto.Address;
            receiver.Priority = updateDto.Priority;

            _context.Receivers.Update(receiver);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Receivers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReceiver(int id)
        {
            var receiver = await _context.Receivers.FindAsync(id);
            if (receiver == null)
                return NotFound();

            _context.Receivers.Remove(receiver);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
