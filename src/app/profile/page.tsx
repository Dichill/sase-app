import ProfileHeader from "@/components/profile/ProfileHeader";
import PersonalInfo from "@/components/profile/PersonalInfo";
import IncomeSnapshot from "@/components/profile/IncomeSnapshot";
import AdditionalInfo from "@/components/profile/OtherInfo";
import ProfileDocuments from "@/components/profile/ProfileDocuments";

const Profile = () => {
    return (
        <div className="h-full overflow-y-auto">
            <div
                className="container mx-auto w-full px-10"
                style={{ marginTop: "48px", marginBottom: "64px" }}
            >
                <div className="flex justify-center gap-4">
                    <ProfileHeader
                        profilepic="/profilepic.png"
                        name="Prince Charming"
                        bio="Prince Charming, 32. Professional dragon-dodger, glass slipper enthusiast, and heir to at least one questionable kingdom. Already found my happily ever after, so only seeking for a cozy 3-bed, 2-bath castle (or open-concept cottage will do). Must have room for a white horse, a drawbridge is optional but preferred. Bonus points if it comes with a moat to keep out in-laws."
                    />
                </div>
                <div className="flex gap-4 w-full mt-10">
                    <div className="w-3/5">
                        <div className=" w-full mb-4">
                            <PersonalInfo
                                user={{
                                    name: "Prince Charming",
                                    dateOfBirth: "1991-06-15",

                                    gender: "Male",
                                    address:
                                        "Broke Avenue, Fairy Tale City, Imaginationland",
                                    phoneNumber: "+1234567890",
                                    email: "prince@charming.com",
                                }}
                            />
                        </div>

                        <div className="w-full my-4">
                            <IncomeSnapshot />
                        </div>

                        <div className="w-full my-4">
                            <AdditionalInfo />
                        </div>
                    </div>

                    <div className="w-2/5">
                        <ProfileDocuments />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
