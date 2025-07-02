import dynamic from 'next/dynamic'
const NewsLetter = dynamic(() => import('./NewsLetter'))
const FooterList = dynamic(() => import('./FooterList'))

const Footer = () => {
    return (
        <footer className='bg-[#141A21] container-body'>
            <NewsLetter />
            <FooterList />
        </footer>
    )
}

export default Footer