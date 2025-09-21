interface ProfileHeaderProps {
  profilepic: string;
  name: string;
  bio: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profilepic,
  name,
  bio,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 max-w-4xl text-center">
      <div className="w-24 h-24 rounded-full overflow-hidden">
        <img
          src={profilepic}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
      </div>
      <div>
        <p className="text-gray-600">{bio}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
