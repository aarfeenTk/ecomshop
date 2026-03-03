import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCart } from '../redux/slices/cartSlice';

const useCart = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items, loading } = useSelector(state => state.cart);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user && !loading && !hasFetched.current) {
      dispatch(getCart());
      hasFetched.current = true;
    }
    
    if (!user) {
      hasFetched.current = false;
    }
  }, [dispatch, user, loading]);

  return { items, loading };
};

export default useCart;
