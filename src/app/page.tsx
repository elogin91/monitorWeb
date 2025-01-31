import Link from 'next/link';


export default function Home() {
    return (
        <main>
            <h1>Home</h1>
            <div className='flex justify-center space-x-4'>
                <Link href='/monitor'>
                    <button className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'>Monitor</button>
                </Link>
                <Link href='/chat'>
                    <button className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600'>Chat</button>
                </Link>
            </div>
        </main>
    )
}