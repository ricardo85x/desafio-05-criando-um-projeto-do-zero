import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from "prismic-dom"
import Head from 'next/head'
import Header from '../../components/Header'
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa'
import Prismic from '@prismicio/client'

import { useRouter } from 'next/router'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';

import { Comments } from '../../components/Comments'


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
}

interface PostProps {
  post: Post;
}

const calculateDuration = (content: ContentProps[]) => {

  const words = content.reduce((total, item) => {
    total += item.heading.split(/\S+/g).length
    total += RichText.asText(item.body).split(/\S+/g).length
    return total
  }, 0)

  return Math.ceil(words / 200);
}

export default function Post({ post: rawPost }: PostProps) {

  const router = useRouter()

  const post = !rawPost ? null : {
    createdAt: format(
      new Date(rawPost.first_publication_date),
      "dd LLL yyyy", {
      locale: ptBR
    }),
    title: rawPost.data.title,
    banner: rawPost.data.banner,
    author: rawPost.data.author,
    duration: calculateDuration(rawPost.data.content),
    content: rawPost.data.content
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
                <span>BLA BLA BLA</span>
                <a>Post anterior</a>
              </div>

              <div>
                <span>LA LA LE LA</span>
                <a>Próximo Post</a>
              </div>
            </div>



            <Comments />


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

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const { params: { slug } } = context

  const post = await prismic.getByUID('posts', String(slug), {})

  return {
    props: {
      post
    }
  }

};
