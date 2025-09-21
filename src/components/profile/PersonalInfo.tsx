import {
  DescriptionDetails,
  DescriptionList,
  DescriptionTerm,
} from "../ui/description-list";

interface UserProfile {
  name: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  phoneNumber: string;
  email: string;
}

interface ProfileProps {
  user: UserProfile;
}

const PersonalInfo: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="rounded-lg border px-4 py-6">
      <h2 className="border-b pb-3">Personal Information</h2>
      <DescriptionList>
        <DescriptionTerm>Name</DescriptionTerm>
        <DescriptionDetails>{user.name}</DescriptionDetails>

        <DescriptionTerm>Date of Birth</DescriptionTerm>
        <DescriptionDetails>
          {new Date(user.dateOfBirth).toLocaleDateString()}
        </DescriptionDetails>

        <DescriptionTerm>Gender</DescriptionTerm>
        <DescriptionDetails>{user.gender}</DescriptionDetails>

        <DescriptionTerm>Address</DescriptionTerm>
        <DescriptionDetails>{user.address}</DescriptionDetails>

        <DescriptionTerm>Phone Number</DescriptionTerm>
        <DescriptionDetails>{user.phoneNumber}</DescriptionDetails>

        <DescriptionTerm>Email</DescriptionTerm>
        <DescriptionDetails>{user.email}</DescriptionDetails>
      </DescriptionList>
    </div>
  );
};

export default PersonalInfo;
