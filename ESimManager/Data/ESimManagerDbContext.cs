using Microsoft.EntityFrameworkCore;
using ESimManager.Models;
using ESimManager.Models.Entities;
using System.IO;

namespace ESimManager.Data;

/// <summary>
/// Entity Framework Core database context for the eSIM Manager application
/// </summary>
public class ESimManagerDbContext : DbContext
{
    public DbSet<ESimProfile> Profiles { get; set; } = null!;
    public DbSet<DeviceInfo> Devices { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<AuditLogEntry> AuditLogs { get; set; } = null!;
    public DbSet<ApplicationConfiguration> Configurations { get; set; } = null!;
    public DbSet<QueuedOperation> QueuedOperations { get; set; } = null!;

    public ESimManagerDbContext(DbContextOptions<ESimManagerDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure ESimProfile entity
        modelBuilder.Entity<ESimProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Iccid).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ProviderName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.State).IsRequired();
            entity.Property(e => e.ProfileClass).IsRequired();
            entity.Property(e => e.CreatedDate).IsRequired();
            entity.Property(e => e.ModifiedDate).IsRequired();
            entity.Property(e => e.CustomNotes).HasMaxLength(1000);
            
            // Create index on ICCID for fast lookups
            entity.HasIndex(e => e.Iccid).IsUnique();
            
            // Create index on DeviceId for relationship queries
            entity.HasIndex(e => e.DeviceId);
        });

        // Configure DeviceInfo entity
        modelBuilder.Entity<DeviceInfo>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DeviceId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ConnectionType).IsRequired();
            entity.Property(e => e.Eid).HasMaxLength(32);
            entity.Property(e => e.FirmwareVersion).HasMaxLength(50);
            entity.Property(e => e.Manufacturer).HasMaxLength(100);
            entity.Property(e => e.Model).HasMaxLength(100);
            
            // Create index on DeviceId for fast lookups
            entity.HasIndex(e => e.DeviceId).IsUnique();
            
            // Create index on EID
            entity.HasIndex(e => e.Eid);
        });

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.PasswordSalt).IsRequired();
            entity.Property(e => e.Role).IsRequired();
            entity.Property(e => e.IsActive).IsRequired();
            entity.Property(e => e.CreatedDate).IsRequired();
            
            // Create unique index on Username
            entity.HasIndex(e => e.Username).IsUnique();
        });

        // Configure AuditLogEntry entity
        modelBuilder.Entity<AuditLogEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Timestamp).IsRequired();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Action).IsRequired();
            entity.Property(e => e.ResourceType).HasMaxLength(100);
            entity.Property(e => e.ResourceId).HasMaxLength(100);
            entity.Property(e => e.Result).IsRequired();
            entity.Property(e => e.Details).HasMaxLength(2000);
            entity.Property(e => e.IpAddress).HasMaxLength(45); // IPv6 max length
            
            // Create indexes for common queries
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.Username);
            entity.HasIndex(e => e.Action);
            entity.HasIndex(e => e.UserId);
            
            // Foreign key relationship to User
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure ApplicationConfiguration entity
        modelBuilder.Entity<ApplicationConfiguration>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LogLevel).IsRequired();
            entity.Property(e => e.SessionTimeoutMinutes).IsRequired();
            entity.Property(e => e.ConnectionRetryAttempts).IsRequired();
            entity.Property(e => e.ConnectionTimeoutSeconds).IsRequired();
            entity.Property(e => e.DatabasePath).HasMaxLength(500);
            entity.Property(e => e.EnableAuditLogging).IsRequired();
            entity.Property(e => e.ThemeMode).IsRequired();
            entity.Property(e => e.ProxyAddress).HasMaxLength(200);
            entity.Property(e => e.CreatedDate).IsRequired();
            entity.Property(e => e.ModifiedDate).IsRequired();
        });

        // Configure QueuedOperation entity
        modelBuilder.Entity<QueuedOperation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Operation).IsRequired();
            entity.Property(e => e.ProfileIccid).HasMaxLength(20);
            entity.Property(e => e.OperationData).HasMaxLength(4000);
            entity.Property(e => e.QueuedDate).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.RetryCount).IsRequired();
            entity.Property(e => e.MaxRetries).IsRequired();
            entity.Property(e => e.ErrorMessage).HasMaxLength(2000);
            
            // Create indexes for queue processing
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.QueuedDate);
            entity.HasIndex(e => e.ProfileId);
            
            // Foreign key relationship to ESimProfile
            entity.HasOne<ESimProfile>()
                .WithMany()
                .HasForeignKey(e => e.ProfileId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Seed default data
        SeedDefaultData(modelBuilder);
    }

    /// <summary>
    /// Seeds default data for initial application setup
    /// </summary>
    private void SeedDefaultData(ModelBuilder modelBuilder)
    {
        // Seed default administrator user
        // Password: "Admin@123" (should be changed on first login)
        var defaultAdmin = new User
        {
            Id = 1,
            Username = "admin",
            // Pre-computed hash for "Admin@123" with a fixed salt for seeding
            PasswordHash = Convert.FromBase64String("YourHashHere"), // TODO: Generate proper hash
            PasswordSalt = Convert.FromBase64String("YourSaltHere"), // TODO: Generate proper salt
            Role = UserRole.Administrator,
            IsActive = true,
            CreatedDate = DateTime.UtcNow,
            FailedLoginAttempts = 0
        };

        // Note: In production, the password hash should be generated using PBKDF2
        // This is just a placeholder for the seed data
        // modelBuilder.Entity<User>().HasData(defaultAdmin);

        // Seed default configuration
        var defaultConfig = new ApplicationConfiguration
        {
            Id = 1,
            LogLevel = Models.Entities.LogLevel.Information,
            SessionTimeoutMinutes = 30,
            ConnectionRetryAttempts = 3,
            ConnectionTimeoutSeconds = 10,
            DatabasePath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "NexoraSIM", "ESimManager", "esim-manager.db"),
            EnableAuditLogging = true,
            ThemeMode = ThemeMode.Light,
            ProxyAddress = string.Empty,
            ProxyPort = 0,
            CreatedDate = DateTime.UtcNow,
            ModifiedDate = DateTime.UtcNow
        };

        modelBuilder.Entity<ApplicationConfiguration>().HasData(defaultConfig);
    }
}
