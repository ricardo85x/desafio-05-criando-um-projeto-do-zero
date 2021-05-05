import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link'
import { RichText } from "prismic-dom"
import Head from 'next/head'
import Header from '../../components/Header'
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa'
import Prismic from '@prismicio/client'

import { useRouter } from 'next/router'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { Comments } from '../../components/Comments'
import { formatDate } from '..'


interface ContentProps {
  heading: string;
  body: {
    text: string;
  }[];
}
interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: ContentProps[];
  };
  last_publication_date?: string,
  uid?: string; 
}

interface PostProps {
  post: Post;
  preview: boolean;
  pagination: {
    next?: {
      title: string;
      slug: string;
    },
    prev?: {
      title: string;
      slug: string;
    }
  }
}

const calculateDuration = (content: ContentProps[]) => {

  const words = content.reduce((total, item) => {
    total += item.heading.split(/\S+/g).length
    total += RichText.asText(item.body).split(/\S+/g).length
    return total
  }, 0)

  return Math.ceil(words / 200);
}


export default function Post({ post: rawPost, pagination, preview }: PostProps) {

  const router = useRouter()

  const post = !rawPost ? null : {
    slug: rawPost.uid as string,
    createdAt: formatDate(rawPost.first_publication_date),
    title: rawPost.data.title,
    banner: rawPost.data.banner,
    author: rawPost.data.author,
    duration: calculateDuration(rawPost.data.content),
    content: rawPost.data.content,
    updatedAt: rawPost.last_publication_date && 
      rawPost.last_publication_date !== rawPost.first_publication_date ? 
      formatDate(rawPost.last_publication_date) : ""
  }

  return (

    <>
      <Head>
        <title>Home</title>
      </Head>

      <Header />

      { !router.isFallback && (
        <div className={styles.banner}>
          <img src={post.banner.url} alt={post.banner.alt} />
        </div>

      )}

      <main className={commonStyles.container} >

        {!router.isFallback ? (

          <div className={styles.post}>

            <div>
              <strong>
                {post.title}
              </strong>
              <div className={styles.info}>
                <span>
                  <FaCalendar />
                  <time>{post.createdAt}</time>
                </span>

                <span>
                  <FaUser />
                  <p>{post.author}</p>
                </span>

                <span>
                  <FaClock />
                  <p>{post.duration} min</p>
                </span>

              </div>

              {post.updatedAt !== "" && (
                <div className={styles.edited}>
                  <span >
                    * Editado em {post.updatedAt}
                  </span>
                </div>
                )}

              {post.content.map((content, _index) => (

                <div key={_index} className={styles.content} >
                  <strong>{content.heading}</strong>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(content.body)
                    }}
                  />
                </div>
              ))}


            </div>

            <hr />

            <div className={styles.pagination}>

              
              <div>
                { pagination?.prev && (
                  <>
                    <span>{pagination.prev.title}</span>
                    <Link href={`/post/${pagination.prev.slug}`}>
                      <a>Post anterior</a>
                    </Link>
                  </>
                )}
               
              </div>

              <div>
                { pagination?.next && (
                  <>
                    <span>{pagination.next.title}</span>
                    <Link href={`/post/${pagination.next.slug}`}>
                      <a>Próximo Post</a>
                    </Link>
                  </>
                )}
              
              </div>
            </div>


            <Comments />

            {preview && (
              <aside className={commonStyles.preview} >
                <Link href="/api/exit-preview">
                  <a>Sair do modo Preview</a>
                </Link>
              </aside>
            )}


          </div>

        ) : (
          <div>Carregando...</div>
        )}
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [
      Prismic.Predicates.at('document.type', 'posts'),
    ],
    {
      fetch: ['post.title', 'post.subtitle', 'post.first_publication_date'],
      orderings: '[document.first_publication_date desc]',
      pageSize: 1
    }

  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {
    paths,
    fallback: true
  }

};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
  params
}) => {

  const prismic = getPrismicClient();
  const { slug }  = params

  const post = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  })

  const next = await prismic.query(
    [
      Prismic.Predicates.at('document.type', 'posts'),
    ],
    {
      fetch: ['post.title'],
      orderings: '[document.first_publication_date desc]',
      pageSize: 1,
      after: post.id,
    }
  );

  const prev = await prismic.query(
    [
      Prismic.Predicates.at('document.type', 'posts'),
    ],
    {
      fetch: ['post.title'],
      orderings: '[document.first_publication_date]',
      pageSize: 1,
      after: post.id,
    }
  );

  return {
    props: {
      post,
      preview,
      pagination: {
        next: next.results.length > 0 ? {
          slug: next.results[0].uid,
          title: next.results[0].data?.title
        } : null,
        prev: prev.results.length > 0 ? {
          slug: prev.results[0].uid,
          title: prev.results[0].data?.title
        } : null

      }
    }
  }

};
