import { useEffect, useState } from "react";
import styles from "./styles.module.css";

export default function ProgressBar() {
  //useEffect to control the component lifecycle
  useEffect(() => {
    window.addEventListener("scroll", scrollHeight);
    return () => window.removeEventListener("scroll", scrollHeight);
  });
  //Width State
  const [width, setWidth] = useState(0);
  // scroll function
  const scrollHeight = () => {
    var el = document.documentElement,
      ScrollTop = el.scrollTop || document.body.scrollTop,
      ScrollHeight = el.scrollHeight || document.body.scrollHeight;
    var percent = (ScrollTop / (ScrollHeight - el.clientHeight)) * 100;
    // store percentage in state
    setWidth(percent);
  };
  return (
    <div className={styles.progressBar} style={{ width: width + "%" }}></div>
  );
}
