import { useState } from "react";
import heartImage from "/images/heart.png";

function LikeButton() {
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  const toggleDisplay = () => {
    if (likeCount === 0) {
      setLikeCount(likeCount + 1);
      setLiked(true);
    } else {
      setLikeCount(likeCount - 1);
      setLiked(false);
    }
  };

  const styles = {
    app: {
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    heartBg: {
      background: liked ? "rgba(255, 192, 200, 0.7)" : "rgba(255, 192, 200, 0)",
      borderRadius: "50%",
      height: "60px",
      width: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 100ms ease",
      position: "relative",
      cursor: "pointer",
    },
    heartIcon: {
      height: "100px",
      width: "100px",
      backgroundImage: `url(${'/images/heart.png'})`,
      backgroundSize: "cover",
      backgroundPosition: liked ? "right" : "left",
      position: "absolute",
      animation: liked ? "likeAnim 0.7s steps(28) forwards" : "none",
    },
    likeAmount: {
      fontSize: "20px",
      fontFamily: "Roboto, sans-serif",
      color: liked ? "red" : "#888",
      fontWeight: "900",
      marginLeft: "6px",
    },
    keyframes: `
      @keyframes likeAnim {
        to {
          background-position: right;
        }
      }
    `,
  };

  return (
    <div style={styles.app}>
      <style>{styles.keyframes}</style>
      <div style={styles.heartBg} onClick={toggleDisplay}>
        <div style={styles.heartIcon}></div>
      </div>
      <div style={styles.likeAmount}>{likeCount}</div>
    </div>
  );
}

export default LikeButton;
