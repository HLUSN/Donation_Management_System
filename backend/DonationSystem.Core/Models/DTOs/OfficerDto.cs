using System.ComponentModel.DataAnnotations;

namespace DonationSystem.Core.Models.DTOs
{
    public class OfficerDto
    {
        public int OfficerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Post { get; set; } = string.Empty;
        public string OfficeName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string NICNumber { get; set; } = string.Empty;
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateOfficerDto
    {
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Post is required")]
        public string Post { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Office name is required")]
        public string OfficeName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "NIC number is required")]
        [RegularExpression(@"^(\d{12}|\d{9}[Vv])$", ErrorMessage = "Invalid NIC format. Must be 12 digits or 9 digits followed by V")]
        public string NICNumber { get; set; } = string.Empty;
        
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }

    public class UpdateOfficerDto
    {
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Post is required")]
        public string Post { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Office name is required")]
        public string OfficeName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Address is required")]
        public string Address { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
