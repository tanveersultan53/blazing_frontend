import { Loader } from "lucide-react";

const Loading = () => {

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader className="h-8 w-8 animate-spin" />
    </div>
  );
};

export default Loading;
