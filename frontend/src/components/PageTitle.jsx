import { useEffect } from "react";

function PageTitle({ title }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | ShopEasy`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return null;
}

export default PageTitle;
