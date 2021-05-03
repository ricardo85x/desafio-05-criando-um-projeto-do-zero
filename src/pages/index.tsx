import { GetStaticProps } from 'next';
import Head from 'next/head'
import Prismic from '@prismicio/client'

import Header from '../components/Header'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';

import format from 'date-fns/format';
import ptBR from 'date-fns/locale/pt-BR';

import { FaCalendar, FaUser } from 'react-icons/fa'
import { useEffect, useState } from 'react';




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

interface PostProps {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  updatedAt: string;
}

export default function Home({ postsPagination } : HomeProps) {

  const formatDate = (date_string: string) => {
    try {
      return format(
        new Date(date_string),
        "dd LLL yyyy", {
        locale: ptBR
      })
    } catch {
      return date_string
    }
  }

  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [posts, setPosts] = useState(
    postsPagination.results.map(post => {
      return {
        slug: post.uid,
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
        updatedAt: formatDate(post.first_publication_date)
      }
    }))


  const loadMore = () => {

    if (nextPage) {


      fetch(nextPage)
        .then(response => response.json())
        .then(data => {

          setPosts(
            [
              ...posts,
              ...data.results.map(post => {
                return {

                  slug: post.uid,
                  title: post.data.title,
                  subtitle: post.data.subtitle,
                  author: post.data.author,
                  updatedAt: formatDate(post.first_publication_date)
                }
              })
            ]
          )
          setNextPage(data.next_page)

        })
    }

  }


  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <Header/>



      <main className={commonStyles.container} >

        <div className={styles.posts}>

          {posts?.map(post => (

            <Link key={post.slug} href={`/post/${post.slug}`}>
              <a>
                <strong>{post.title}</strong>
                <p>{post.subtitle}</p>
                <div>
                  <span>
                    <FaCalendar />
                    <time>{post.updatedAt}</time>
                  </span>

                  <span>
                    <FaUser />
                    <p>{post.author}</p>
                  </span>

                </div>

              </a>
            </Link>

          ))}
        </div>


        {nextPage &&
          <div className={styles.loadMore} >
            <button onClick={loadMore}>Carregar mais posts</button>
          </div>
        }

      </main>

    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(

    [
      Prismic.Predicates.at('document.type', 'posts'),
    ],
    {
      fetch: ['post.title', 'post.subtitle', 'post.first_publication_date'],
      orderings: '[document.first_publication_date desc]',
      pageSize: 2
    }

  );

  return {
    props: {
      postsPagination: postsResponse
    }
  }
};
