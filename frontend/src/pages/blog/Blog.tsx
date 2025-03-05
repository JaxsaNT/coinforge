import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, storage } from "../../components/firebase/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import Sidebar from "../../components/Sidebar";
import Loader from "../../components/Loader";

interface BlogPost {
  id: string;
  title: string;
  authorId: string;
  imageUrl: string;
  authorName: string;
  authorAvatar: string;
  slug: string;
  createdAt: {
    toDate(): Date;
  };
}

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      try {
        const blogCollectionRef = collection(db, "blog");
        const snapshot = await getDocs(blogCollectionRef);
        const posts: BlogPost[] = [];

        for (const doc of snapshot.docs) {
          const postData = doc.data();
          const imageUrl = await getImageUrl(postData.img);
          posts.push({
            id: doc.id,
            title: postData.title,
            authorId: postData.authorId,
            imageUrl: imageUrl || "",
            authorName: postData.authorName,
            authorAvatar: postData.authorAvatar,
            createdAt: postData.createdAt,
            slug: postData.slug,
          });
        }

        setBlogPosts(posts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    const getImageUrl = async (imagePath: string): Promise<string | null> => {
      try {
        const storageRef = ref(storage, imagePath);
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
      } catch (error) {
        console.error("Error fetching image URL:", error);
        return null;
      }
    };

    fetchBlogPosts();
  }, []);

  return (
    <>
      <Sidebar />
      <main className="h-full px-4 py-12 lg:pl-72">
        <div className="w-full mx-auto mb-12 sm:px-6 lg:px-8 lg:w-10/12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-red-600">
              Blog and Tutorials
            </h1>
            <p className="mt-2 text-lg leading-8 text-gray-300">
              Learn about Coinforge and crypto token management in general on
              solana.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 mx-auto mt-16 lg:grid-cols-2 xl:grid-cols-3">
            {loading && (
              <div className="flex items-center justify-center col-span-3">
                <Loader />
              </div>
            )}
            {!loading && (
              <>
                {blogPosts.map((post) => (
                  <Link to={`/solana/blog/${post.slug}`} key={post.id}>
                    <article className="relative flex flex-col justify-end px-8 pb-8 overflow-hidden bg-gray-900 isolate rounded-2xl pt-52 sm:pt-48 lg:pt-52 h-96">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="absolute inset-0 object-cover w-full h-full -z-10"
                      />
                      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                      <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                      <div className="">
                        <div className="flex items-center mb-2">
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-6 h-6 mr-1 rounded-full"
                          />
                          <h4 className="text-white ext-sm">
                            {post.authorName}
                          </h4>
                        </div>
                        <time dateTime={post.createdAt.toDate().toISOString()}>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 rounded-md bg-gray-900/75 ring-1 ring-inset ring-gray-400/20">
                            {post.createdAt.toDate().toLocaleDateString()}
                          </span>
                        </time>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold leading-6 text-white">
                        {post.title}
                      </h3>
                    </article>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Blog;
