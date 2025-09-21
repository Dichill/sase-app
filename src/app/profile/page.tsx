import ProfileHeader from "@/components/profile/ProfileHeader";
import PersonalInfo from "@/components/profile/PersonalInfo";
import IncomeSnapshot from "@/components/profile/IncomeSnapshot";
import AdditionalInfo from "@/components/profile/OtherInfo";

const Profile = () => {
    return (
        <div
            className="container mx-auto w-full"
            style={{ marginTop: "48px", marginBottom: "64px" }}
        >
            <div className="flex justify-center gap-4">
                <ProfileHeader
                    profilepic="/profilepic.png"
                    name="Prince Charming"
                    bio="Prince Charming, 32. Professional dragon-dodger, glass slipper enthusiast, and heir to at least one questionable kingdom. Already found my happily ever after, so only seeking for a cozy 3-bed, 2-bath castle (or open-concept cottage will do). Must have room for a white horse, a drawbridge is optional but preferred. Bonus points if it comes with a moat to keep out in-laws."
                />
            </div>
            <div className="mt-10 flex justify-center gap-4">
                <PersonalInfo
                    user={{
                        name: "Prince Charming",
                        dateOfBirth: new Date("1991-06-15"),

                        gender: "Male",
                        address:
                            "Broke Avenue, Fairy Tale City, Imaginationland",
                        phoneNumber: "+1234567890",
                        email: "prince@charming.com",
                    }}
                />
            </div>

            <div>
                <IncomeSnapshot />
            </div>

            <div>
                <AdditionalInfo />
            </div>
        </div>
    );
};

export default Profile;
