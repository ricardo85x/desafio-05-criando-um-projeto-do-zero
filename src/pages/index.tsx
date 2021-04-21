import { GetStaticProps } from 'next';
import Head from 'next/head'
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


import { FaCalendar, FaUser } from 'react-icons/fa'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ posts }) {

  console.log(posts);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <main className={styles.container} >

        <div className={styles.posts}>

          {posts?.map(post => (


       

              <Link key={post.slug} href="#">
                <a>
                  <strong>{post.title}</strong>
                  <p>{post.subtitle}</p>
                  <span>
                    <FaCalendar />
                    <time>{post.updatedAt}</time>
                    <FaUser />
                    <p>{post.author}</p>


                  </span>

                </a>
              </Link>

         



          ))}
        </div>



      </main>

    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(

    [
      Prismic.Predicates.at('document.type', 'posts'),
    ],
    {
      fetch: ['post.title', 'post.subtitle', 'post.first_publication_date'],
      pageSize: 25,

    }

  );


  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
      updatedAt: format(
        new Date(post.last_publication_date),
        "dd LLL yyyy", {
        locale: ptBR
      })

    }
  })

  return {
    props: {
      posts
    }
  }

  // TODO
};
