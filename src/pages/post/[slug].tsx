import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from "prismic-dom"


import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post() {
  
  return (
    <div>Ola post</div>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  // TODO


  return { 
    paths: [],
    fallback: 'blocking'
}

};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();


  const { params : { slug } } = context

  console.log("slug", slug)

  const response = await prismic.getByUID('posts', String(slug), {})
  
  console.log("resposta",response)


  const post = {
      slug,
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,

  }

  return { props : {
      post
  }}


};
