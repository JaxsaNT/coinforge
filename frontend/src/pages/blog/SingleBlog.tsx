import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { db } from "../../components/firebase/FirebaseConfig";
import { query, where, getDocs, collection } from "firebase/firestore";
import PageHeader from "../../components/PageHeader";
import { SocialIcon } from "react-social-icons";
import Sidebar from "../../components/Sidebar";

// Define the type of Post
interface Post {
  title: string;
  content: string;
  img: string;
  authorAvatar: string;
  authorName: string;
  createdAt: {
    toDate(): Date;
  };
  // Add other properties as needed
}

const SingleBlog = () => {
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const url = location.pathname.split("/").pop();
      const postsQuery = query(
        collection(db, "blog"),
        where("slug", "==", url)
      );
      const postsSnapshot = await getDocs(postsQuery);
      if (!postsSnapshot.empty) {
        const postData = postsSnapshot.docs[0].data() as Post; // Type assertion
        setPost(postData);
      } else {
        // Handle case where post is not found
      }
      setLoading(false);
    };

    fetchPost();
  }, [location.pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  // Function to truncate content to 170 characters
  const truncateDescription = (content: string) => {
    const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>/g, "");
    };

    const cleanContent = stripHtml(content);
    const maxLength = 170;
    if (cleanContent.length > maxLength) {
      const truncatedContent = cleanContent.substring(0, maxLength);
      const lastSpace = truncatedContent.lastIndexOf(" ");
      return truncatedContent.substring(0, lastSpace) + "...";
    }

    return cleanContent;
  };

  return (
    <>
      <PageHeader
        title={post.title}
        description={truncateDescription(post.content)}
        imageUrl={post.img}
      />
      <Sidebar />
      <main className="h-full px-4 py-12 lg:pl-72">
        <div className="w-full mx-auto mb-12 sm:px-6 lg:px-8 lg:w-10/12 xl:w-8/12">
          <h1 className="mb-4 text-5xl">{post.title}</h1>
          <div className="flex justify-between mb-2">
            <div className="flex items-center space-x-2">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-6 h-6 rounded-full"
              />
              <Link
                to="https://twitter.com/0xProsp3ctor"
                target="_blank"
                rel="noreferrer noopener"
              >
                <h4 className="text-sm text-white">{post.authorName}</h4>
              </Link>
              <SocialIcon
                url="https://twitter.com/0xProsp3ctor"
                style={{ height: 16, width: 16 }}
                target="_blank"
              />
            </div>
            <time
              dateTime={post.createdAt.toDate().toLocaleDateString()}
              className="block mt-1 text-sm leading-6 text-gray-300"
            >
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 rounded-md bg-gray-400/10 ring-1 ring-inset ring-gray-400/20">
                Added: {post.createdAt.toDate().toLocaleDateString()}
              </span>
            </time>
          </div>
          <img className="mb-4 rounded" src={post.img} alt={post.title} />
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </main>
    </>
  );
};

export default SingleBlog;
