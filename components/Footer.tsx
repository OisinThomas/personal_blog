import Socials from "./Socials";
import clsx from "clsx";

export default function Footer(props: any) {
  return (
    <footer className={clsx("flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 py-8 mt-16", props)}>
      <div className="text-sm">© Oisín Thomas</div>
      <Socials/>
    </footer>
  );
}

