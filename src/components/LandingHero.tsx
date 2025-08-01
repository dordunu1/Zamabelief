import React from 'react';
import { FaUsers, FaVoteYea, FaCheckCircle, FaComments, FaGavel, FaChartBar, FaShieldAlt, FaLock } from 'react-icons/fa';

const chatMessages = [
  {
    sender: 'Alex',
    avatar: '🧑',
    text: "Hot take: Our project will launch before the end of the month!",
    align: 'left',
    color: 'bg-mint-100',
  },
  {
    sender: 'Jamie',
    avatar: '👩',
    text: "No way! There are too many bugs left. I bet it won't happen.",
    align: 'right',
    color: 'bg-orange-100',
  },
  {
    sender: 'Alex',
    avatar: '🧑',
    text: "Let's settle this on Conviction Markets! Winner takes the glory!",
    align: 'left',
    color: 'bg-mint-100',
  },
];

const l2Chat = [
  {
    sender: 'Sam',
    avatar: '🧑‍💻',
    text: "Hot take: L2s will take over Ethereum! Cheap, fast, and scalable!",
    align: 'left',
    color: 'bg-mint-100',
  },
  {
    sender: 'Priya',
    avatar: '👩‍🔬',
    text: "Controversial opinion: L1s are here to stay. Security and decentralization matter most!",
    align: 'right',
    color: 'bg-orange-100',
  },
  {
    sender: 'Sam',
    avatar: '🧑‍💻',
    text: "Let's settle this on Conviction Markets! Winner takes the glory!",
    align: 'left',
    color: 'bg-mint-100',
  },
];

const sportsChat = [
  {
    sender: 'Chris',
    avatar: '⚽',
    text: "Hot take: Messi is the GOAT! No one comes close!",
    align: 'left',
    color: 'bg-mint-100',
  },
  {
    sender: 'Alex',
    avatar: '🏆',
    text: "Controversial opinion: Ronaldo is the real king! Check the stats!",
    align: 'right',
    color: 'bg-orange-100',
  },
  {
    sender: 'Chris',
    avatar: '⚽',
    text: "Or maybe we should settle ManU vs Chelsea once and for all!",
    align: 'left',
    color: 'bg-mint-100',
  },
  {
    sender: 'Alex',
    avatar: '🏆',
    text: "Only on Conviction Markets!",
    align: 'right',
    color: 'bg-orange-100',
  },
];

const GlowBg = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-mint-200 opacity-40 blur-3xl animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-orange-100 opacity-40 blur-2xl animate-pulse" />
    <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full bg-white opacity-30 blur-2xl -translate-x-1/2 -translate-y-1/2" />
  </div>
);

const LandingHero: React.FC<{ onCreate: () => void; onBrowse: () => void; }> = ({ onCreate, onBrowse }) => {
  return (
    <>
      <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-mint-200 via-white to-orange-100 py-20 px-4 rounded-lg shadow-2xl mt-8 overflow-hidden overflow-x-hidden">
        <GlowBg />
        <h1 className="text-4xl md:text-5xl font-extrabold text-mint-700 mb-4 text-center drop-shadow-sm">
          Welcome to Conviction Markets
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 text-center max-w-2xl">
          Create and participate in opinion markets where hot takes, beliefs, and predictions are settled by community conviction. Stake your opinion, back your takes, and help shape the future—one conviction at a time.
        </p>
        {/* Prominent Action Buttons - now above chat messages */}
        <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <button
            onClick={onCreate}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg shadow transition-all text-lg cursor-pointer w-full sm:w-auto"
            style={{ minWidth: 200 }}
          >
            Create Market
          </button>
          <button
            onClick={onBrowse}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg shadow transition-all text-lg cursor-pointer w-full sm:w-auto"
            style={{ minWidth: 200 }}
          >
            Browse Markets
          </button>
        </div>
        {/* Chat Bubble Conversation */}
        <div className="w-full max-w-3xl mb-10 flex flex-col gap-3">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${msg.align === 'right' ? 'justify-end' : 'justify-start'} items-center`}
            >
              {msg.align === 'left' && (
                <>
                  <span className="text-2xl select-none">{msg.avatar}</span>
              <div
                    className={`rounded-2xl px-5 py-3 shadow-md ${msg.color} max-w-[75%] text-gray-800 text-base font-medium flex items-center ml-2 self-start w-fit`}
                    style={{ borderTopLeftRadius: '0.5rem', borderTopRightRadius: '2rem' }}
              >
                {msg.text}
              </div>
                </>
              )}
              {msg.align === 'right' && (
                <>
                  <div
                    className={`rounded-2xl px-5 py-3 shadow-md ${msg.color} max-w-[75%] text-gray-800 text-base font-medium flex items-center mr-2 self-end w-fit`}
                    style={{ borderTopLeftRadius: '2rem', borderTopRightRadius: '0.5rem' }}
                  >
                    {msg.text}
                  </div>
                  <span className="text-2xl select-none">{msg.avatar}</span>
                </>
              )}
            </div>
          ))}
        </div>
        {/* L2s vs L1s Chat Section */}
        <div className="w-full max-w-3xl mb-10 flex flex-col gap-3">
          {l2Chat.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${msg.align === 'right' ? 'justify-end' : 'justify-start'} items-center`}
            >
              {msg.align === 'left' && (
                <>
                  <span className="text-2xl select-none">{msg.avatar}</span>
              <div
                    className={`rounded-2xl px-5 py-3 shadow-md ${msg.color} max-w-[75%] text-gray-800 text-base font-medium flex items-center ml-2 self-start w-fit`}
                    style={{ borderTopLeftRadius: '0.5rem', borderTopRightRadius: '2rem' }}
          >
                {msg.text}
              </div>
                </>
              )}
              {msg.align === 'right' && (
                <>
                  <div
                    className={`rounded-2xl px-5 py-3 shadow-md ${msg.color} max-w-[75%] text-gray-800 text-base font-medium flex items-center mr-2 self-end w-fit`}
                    style={{ borderTopLeftRadius: '2rem', borderTopRightRadius: '0.5rem' }}
                  >
                    {msg.text}
                  </div>
                  <span className="text-2xl select-none">{msg.avatar}</span>
                </>
              )}
            </div>
          ))}
        </div>
        {/* Sports Chat Section */}
        <div className="w-full max-w-3xl mb-10 flex flex-col gap-3">
          {sportsChat.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${msg.align === 'right' ? 'justify-end' : 'justify-start'} items-center`}
            >
              {msg.align === 'left' && (
                <>
                  <span className="text-2xl select-none">{msg.avatar}</span>
              <div
                    className={`rounded-2xl px-5 py-3 shadow-md ${msg.color} max-w-[75%] text-gray-800 text-base font-medium flex items-center ml-2 self-start w-fit`}
                    style={{ borderTopLeftRadius: '0.5rem', borderTopRightRadius: '2rem' }}
          >
                {msg.text}
              </div>
                </>
              )}
              {msg.align === 'right' && (
                <>
                  <div
                    className={`rounded-2xl px-5 py-3 shadow-md ${msg.color} max-w-[75%] text-gray-800 text-base font-medium flex items-center mr-2 self-end w-fit`}
                    style={{ borderTopLeftRadius: '2rem', borderTopRightRadius: '0.5rem' }}
                  >
                    {msg.text}
                  </div>
                  <span className="text-2xl select-none">{msg.avatar}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FHEVM & ZAMA Highlight Section as horizontal cards */}
      <section className="w-full max-w-5xl mx-auto mt-8 mb-8 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-orange-100 text-orange-500 font-bold px-3 py-1 rounded-full text-xs tracking-wide shadow">
            Powered by ZAMA FHEVM
          </span>
        </div>
        <div className="w-full overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[320px]">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col items-center shadow">
              <FaLock className="text-orange-400 mb-2" size={32} />
              <h4 className="font-bold text-orange-500 mb-1 text-center">Encrypted Betting</h4>
              <p className="text-sm text-orange-500 text-center">Your bet is <b>encrypted</b> in your browser using ZAMA FHEVM.</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col items-center shadow">
              <FaShieldAlt className="text-orange-400 mb-2" size={32} />
              <h4 className="font-bold text-orange-500 mb-1 text-center">On-Chain Privacy</h4>
              <p className="text-sm text-orange-500 text-center">Encrypted bets are sent to the blockchain—no one (not even us) can see your choice.</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col items-center shadow">
              <FaGavel className="text-orange-400 mb-2" size={32} />
              <h4 className="font-bold text-orange-500 mb-1 text-center">Verifiable Results</h4>
              <p className="text-sm text-orange-500 text-center">After the market closes, the contract decrypts the tally and distributes rewards, all on-chain.</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col items-center shadow">
              <FaCheckCircle className="text-orange-400 mb-2" size={32} />
              <h4 className="font-bold text-orange-500 mb-1 text-center">Guaranteed Fairness</h4>
              <p className="text-sm text-orange-500 text-center">Privacy and fairness are mathematically guaranteed.</p>
            </div>
          </div>
        </div>
      </section>
      {/* About/Features Section */}
      <section className="w-full max-w-4xl mx-auto mt-12 mb-8 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-mint-700 mb-4 text-center">A Home for DAOs & Communities to Settle Real Debates</h2>
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center mb-6">
          <div className="flex items-center gap-3"><FaVoteYea className="text-mint-500 text-xl" /><span className="text-gray-700 text-base">Settle hot takes and controversial opinions with transparent betting.</span></div>
          <div className="flex items-center gap-3"><FaChartBar className="text-orange-400 text-xl" /><span className="text-gray-700 text-base">Let your community stake conviction on outcomes.</span></div>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center mb-6">
          <div className="flex items-center gap-3"><FaComments className="text-mint-500 text-xl" /><span className="text-gray-700 text-base">Turn debates into action—no more endless arguments.</span></div>
          <div className="flex items-center gap-3"><FaUsers className="text-orange-400 text-xl" /><span className="text-gray-700 text-base">Anyone can create a market, anyone can participate.</span></div>
        </div>
        <div className="w-full flex items-center justify-center mb-2">
          <FaCheckCircle className="text-mint-500 text-2xl mr-2" />
          <span className="text-gray-700 text-base">Results are on-chain and tamper-proof.</span>
        </div>
        <div className="w-full flex justify-center mt-6 mb-2">
          <div className="h-1 w-32 bg-gradient-to-r from-mint-200 via-orange-100 to-mint-200 rounded-full" />
        </div>
      </section>
      {/* How it Works Section */}
      <section className="w-full max-w-4xl mx-auto mb-16 bg-mint-50 rounded-xl shadow p-8 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-6 text-center">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
          <div className="flex flex-col items-center">
            <FaGavel className="text-3xl text-mint-500 mb-2" />
            <span className="font-semibold text-gray-700 mb-1">1. Create a Market</span>
            <span className="text-gray-500 text-sm text-center">Start a new debate or question for your community.</span>
          </div>
          <div className="flex flex-col items-center">
            <FaVoteYea className="text-3xl text-orange-400 mb-2" />
            <span className="font-semibold text-gray-700 mb-1">2. Back Your Take</span>
            <span className="text-gray-500 text-sm text-center">Stake your conviction on the opinion you believe in.</span>
          </div>
          <div className="flex flex-col items-center">
            <FaUsers className="text-3xl text-mint-500 mb-2" />
            <span className="font-semibold text-gray-700 mb-1">3. Community Opinions</span>
            <span className="text-gray-500 text-sm text-center">Everyone participates, and the majority decides.</span>
          </div>
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-3xl text-orange-400 mb-2" />
            <span className="font-semibold text-gray-700 mb-1">4. Outcome is Settled</span>
            <span className="text-gray-500 text-sm text-center">The result is final, transparent, and on-chain.</span>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full flex justify-center items-center py-6 mt-8 border-t border-mint-100 bg-white/80">
        <FaShieldAlt className="text-orange-500 text-2xl mr-2" />
        <span className="text-mint-700 font-bold text-lg">Built on Belief Protocol</span>
      </footer>
    </>
  );
};

export default LandingHero; 