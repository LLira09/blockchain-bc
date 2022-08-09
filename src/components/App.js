import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import config from '../config.json'
import { loadProvider, loadNetwork, loadAccount, loadToken } from '../store/interactions'



function App() {
  const dispatch = useDispatch()
  const loadBlockChainData = async () => {
    await loadAccount(dispatch)

    // Connect ethers to blockchain
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)


    // Token Smart contract
    await loadToken(provider, config[chainId].dAPP.address, dispatch)

  }

  useEffect(() => {
    loadBlockChainData()
  })
  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;