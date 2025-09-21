import { Separator } from "@radix-ui/react-select";
import { Bed, Bath, MapPin, Star, Phone, Mail, Tag } from "lucide-react";
import { Button } from "../ui/button";
interface ListingCardProps {
  id: number;
  address: string;
  city: string;
  phoneNumber: string;
  email: string;
  bedrooms: string;
  bathrooms: string;
  cost: number;
}

const ListingCard: React.FC<ListingCardProps> = ({
  id,
  address,
  phoneNumber,
  city,
  email,
  bedrooms,
  bathrooms,
  cost,
}) => {
  const formattedUSD = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cost);

  return (
    <div
      className="max-w-xs bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => {}}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{address}</h3>
          {/* city  */}
          <div className="flex items-center gap-2 my-1">
            <MapPin className="w-4 h-4" />
            <p className="text-gray-600 ">{city}</p>
          </div>
          {/* beds and bath */}
          <div className="flex items-center justify-between my-4">
            <div>
              <h4 className="text-gray-600 text-sm">Details</h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 ">
                  <p className="text-gray-900 font-semibold">{bedrooms}</p>
                  <Bed className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 ">
                  <p className="text-gray-900 font-semibold">{bathrooms}</p>
                  <Bath className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-gray-600 text-sm">Cost</h4>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <p className="text-gray-900 font-semibold">{formattedUSD}</p>
              </div>
            </div>
          </div>

          <Separator className="border-b" />
          {/* contact */}
          <div className="my-2 pt-2">
            <div className="flex items-center gap-2 my-1">
              <Phone className="w-4 h-4" />
              <p className="text-gray-900 font-medium">{phoneNumber}</p>
            </div>
            <div className="flex items-center gap-2 my-1">
              <Mail className="w-4 h-4" />
              <p className="text-gray-900 font-medium">{email}</p>
            </div>
          </div>
          {/* <Button className="w-full">View Listing</Button> */}
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
