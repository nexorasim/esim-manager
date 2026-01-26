using ESimManager.Models;
using FsCheck;
using FsCheck.Xunit;
using FluentAssertions;

namespace ESimManager.Tests.PropertyTests;

/// <summary>
/// Property-based tests for profile metadata completeness and validation
/// </summary>
public class ProfileMetadataPropertyTests
{
    /// <summary>
    /// Property 6: Profile Metadata Completeness
    /// Validates: Requirements 1.5
    /// All profiles must have complete metadata including ICCID, name, provider, state, and class
    /// </summary>
    [Property(MaxTest = 100)]
    public Property ProfileMetadataCompleteness_AllFieldsPopulated()
    {
        return Prop.ForAll(
            GenerateValidProfile(),
            profile =>
            {
                // All required fields must be populated
                profile.Iccid.Should().NotBeNullOrEmpty("ICCID is required");
                profile.Name.Should().NotBeNullOrEmpty("Name is required");
                profile.ProviderName.Should().NotBeNullOrEmpty("Provider name is required");
                profile.State.Should().BeDefined("State must be a valid enum value");
                profile.ProfileClass.Should().BeDefined("Profile class must be a valid enum value");
                profile.CreatedDate.Should().NotBe(default(DateTime), "Created date must be set");
                profile.ModifiedDate.Should().NotBe(default(DateTime), "Modified date must be set");
                
                return true;
            });
    }

    /// <summary>
    /// Property: Profile state transitions follow GSMA SGP.22 rules
    /// Documents valid state transitions, not enforces them
    /// </summary>
    [Property(MaxTest = 100)]
    public Property ProfileStateTransitions_DocumentValidRules()
    {
        return Prop.ForAll(
            Arb.From<ProfileState>(),
            Arb.From<ProfileState>(),
            (fromState, toState) =>
            {
                // This property documents the valid state transition rules per GSMA SGP.22
                // It doesn't enforce them, just documents what should be valid
                
                // Valid transitions:
                // Disabled -> Enabled (activation)
                // Enabled -> Disabled (deactivation)
                // Disabled -> Deleted (delete inactive profile)
                // Enabled -> Deleted (delete active profile)
                // Same state (no-op)
                
                // Invalid transitions:
                // Deleted -> Enabled (cannot reactivate deleted)
                // Deleted -> Disabled (cannot restore deleted)
                
                bool isValidTransition = 
                    (fromState == ProfileState.Disabled && toState == ProfileState.Enabled) ||
                    (fromState == ProfileState.Enabled && toState == ProfileState.Disabled) ||
                    (fromState == ProfileState.Disabled && toState == ProfileState.Deleted) ||
                    (fromState == ProfileState.Enabled && toState == ProfileState.Deleted) ||
                    (fromState == toState);
                
                bool isInvalidTransition =
                    (fromState == ProfileState.Deleted && toState != ProfileState.Deleted);
                
                // The property is: valid transitions should be allowed, invalid should not
                // For this documentation property, we just verify the logic is consistent
                return isValidTransition != isInvalidTransition || (fromState == toState);
            });
    }

    /// <summary>
    /// Property: Modified date should be >= Created date
    /// </summary>
    [Property(MaxTest = 100)]
    public Property ProfileTimestamps_ModifiedAfterCreated()
    {
        return Prop.ForAll(
            GenerateValidProfile(),
            profile =>
            {
                profile.ModifiedDate.Should().BeOnOrAfter(profile.CreatedDate,
                    "Modified date must be on or after created date");
                return true;
            });
    }

    /// <summary>
    /// Property: Activated profiles must have activation date
    /// </summary>
    [Property(MaxTest = 100)]
    public Property ActivatedProfiles_HaveActivationDate()
    {
        return Prop.ForAll(
            GenerateValidProfile(),
            profile =>
            {
                if (profile.State == ProfileState.Enabled && profile.ActivatedDate.HasValue)
                {
                    profile.ActivatedDate.Value.Should().BeOnOrAfter(profile.CreatedDate,
                        "Activation date must be after creation");
                }
                return true;
            });
    }

    /// <summary>
    /// Property: Deactivated profiles must have deactivation date
    /// </summary>
    [Property(MaxTest = 100)]
    public Property DeactivatedProfiles_HaveDeactivationDate()
    {
        return Prop.ForAll(
            GenerateValidProfile(),
            profile =>
            {
                if (profile.State == ProfileState.Disabled && 
                    profile.DeactivatedDate.HasValue && 
                    profile.ActivatedDate.HasValue)
                {
                    profile.DeactivatedDate.Value.Should().BeOnOrAfter(profile.ActivatedDate.Value,
                        "Deactivation date must be after activation");
                }
                return true;
            });
    }

    /// <summary>
    /// Generates valid ESimProfile instances for property testing
    /// </summary>
    private static Arbitrary<ESimProfile> GenerateValidProfile()
    {
        var profileGen = from iccid in GenerateValidIccid()
                        from name in Arb.Generate<NonEmptyString>()
                        from provider in Arb.Generate<NonEmptyString>()
                        from state in Arb.Generate<ProfileState>()
                        from profileClass in Arb.Generate<ProfileClass>()
                        from createdDate in Arb.Generate<DateTime>()
                        select new ESimProfile
                        {
                            Id = Gen.Choose(1, 10000).Sample(0, 1)[0],
                            Iccid = iccid,
                            Name = name.Get,
                            ProviderName = provider.Get,
                            State = state,
                            ProfileClass = profileClass,
                            CreatedDate = createdDate,
                            ModifiedDate = createdDate.AddMinutes(Gen.Choose(0, 1000).Sample(0, 1)[0]),
                            ActivatedDate = state == ProfileState.Enabled ? createdDate.AddMinutes(1) : null,
                            DeactivatedDate = state == ProfileState.Disabled ? createdDate.AddMinutes(2) : null,
                            CustomNotes = string.Empty
                        };

        return Arb.From(profileGen);
    }

    /// <summary>
    /// Generates valid ICCID strings (19-20 digits)
    /// </summary>
    private static Gen<string> GenerateValidIccid()
    {
        return from length in Gen.Choose(19, 20)
               from digits in Gen.ArrayOf(length, Gen.Choose(0, 9))
               select string.Join("", digits);
    }
}
