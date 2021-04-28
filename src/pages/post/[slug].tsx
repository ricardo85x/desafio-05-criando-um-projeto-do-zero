import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from "prismic-dom"
import Head from 'next/head'
import Header from '../../components/Header'
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa'
import Prismic from '@prismicio/client'


import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';


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

const calculateDuration = (content: ContentProps) => {

  const words = String(
    content.heading +
    " " +
    RichText.asText(content.body)).split(/(\w+)/)

  return Math.ceil(words.length / 200);
}

export default function Post({ post: rawPost }: PostProps) {

  let post;

  if (rawPost) {
    post = {
      createdAt: format(
        new Date(rawPost.first_publication_date),
        "dd LLL yyyy", {
        locale: ptBR
      }),
      title: rawPost.data.title,
      banner: rawPost.data.banner,
      author: rawPost.data.author,
      duration: calculateDuration(rawPost.data.content[0]),
      body: RichText.asHtml(rawPost.data.content[0].body),
    }
  }



  /*
    duration = parseInt(number os words / 200 (qtd humano le por mininuto))
  */



  console.log("Ola ", rawPost)


  return (

    <>
      <Head>
        <title>Home</title>
      </Head>

      <Header />

      <main className={styles.container} >



        {post ? (

          <>
            <div className={styles.banner}>
              <img src={post.banner.url} alt={post.banner.alt} />
            </div>

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

                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{
                    __html: post.body
                  }}
                />
              </div>
            </div>
          </>

        ) : (
          <div>Carregando...</div>
        )}





      </main>
    </>
  )
}

export const getStaticPaths = async () => {

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
