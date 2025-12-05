using Microsoft.EntityFrameworkCore;
using DonationSystem.Core.Models.Entities;

namespace DonationSystem.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Officer> Officers { get; set; }
        public DbSet<Donor> Donors { get; set; }
        public DbSet<Receiver> Receivers { get; set; }
        public DbSet<Donation> Donations { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Distribution> Distributions { get; set; }
        public DbSet<Route> Routes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Officer configuration
            modelBuilder.Entity<Officer>()
                .HasIndex(o => o.NICNumber)
                .IsUnique();

            modelBuilder.Entity<Officer>()
                .HasMany(o => o.Donations)
                .WithOne(d => d.Officer)
                .HasForeignKey(d => d.OfficerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Officer>()
                .HasMany(o => o.Distributions)
                .WithOne(d => d.Officer)
                .HasForeignKey(d => d.OfficerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Donor configuration
            modelBuilder.Entity<Donor>()
                .HasIndex(d => d.NICNumber)
                .IsUnique();

            // Donation configuration
            modelBuilder.Entity<Donation>()
                .HasOne(d => d.Officer)
                .WithMany(o => o.Donations)
                .HasForeignKey(d => d.OfficerId);

            modelBuilder.Entity<Donation>()
                .HasOne(d => d.Donor)
                .WithMany(d => d.Donations)
                .HasForeignKey(d => d.DonorId);

            // Item configuration
            modelBuilder.Entity<Item>()
                .HasOne(i => i.Donor)
                .WithMany(d => d.Items)
                .HasForeignKey(i => i.DonorId);

            modelBuilder.Entity<Item>()
                .HasOne(i => i.Receiver)
                .WithMany(r => r.Items)
                .HasForeignKey(i => i.ReceiverId);

            // Distribution configuration
            modelBuilder.Entity<Distribution>()
                .HasOne(d => d.Item)
                .WithOne()
                .HasForeignKey<Distribution>(d => d.ItemId);

            modelBuilder.Entity<Distribution>()
                .HasOne(d => d.Receiver)
                .WithMany(r => r.Distributions)
                .HasForeignKey(d => d.ReceiverId);

            // Route configuration
            modelBuilder.Entity<Route>()
                .HasOne(r => r.Distribution)
                .WithMany(d => d.Routes)
                .HasForeignKey(r => r.DistributionId);

            modelBuilder.Entity<Route>()
                .HasOne(r => r.FromOfficer)
                .WithMany()
                .HasForeignKey(r => r.FromOfficerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}