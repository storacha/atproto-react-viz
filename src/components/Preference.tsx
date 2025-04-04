import { BskyPreferences } from "@atproto/api";
import ReactJson from "react-json-view";

type Props = {
  preference: BskyPreferences;
};

export const Preference = ({ preference }: Props) => {
  return (
    <div className="rounded-lg shadow-lg p-4">
      <div className="border rounded-lg p-4 overflow-y-scroll h-full">
        <ReactJson src={preference} />
      </div>
    </div>
  );
};
