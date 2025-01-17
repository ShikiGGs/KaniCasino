import { useContext, useEffect, useState } from "react";
import { getUser, getInventory } from "../services/users/UserServices";
import { FiFilter } from 'react-icons/fi'
import UserInfo from "../components/profile/UserInfo";
import Item from "../components/Item";
import UserContext from "../UserContext";
import Skeleton from "react-loading-skeleton";
import MainButton from "../components/MainButton";
import Filters from "../components/profile/Filters";

interface User {
  id: number;
  username: string;
  profilePicture: string;
  level: number;
  xp: number;
  fixedItem: {
    name: string;
    image: string;
    rarity: number;
    description: string;
  };
}

interface Inventory {
  totalPages: number;
  currentPage: number;
  items: any[];
}


const Profile = () => {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingInventory, setLoadingInventory] = useState<boolean>(true);
  const [inventory, setInventory] = useState<Inventory>();
  const [invItems, setInvItems] = useState<any[]>([]);
  const { userData } = useContext(UserContext);
  const [isSameUser, setIsSameUser] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [openFilters, setOpenFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    name: '',
    rarity: '',
    sortBy: '',
    order: 'asc'
  });

  //get id from url
  const id = window.location.pathname.split("/")[2];

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    //1.5 second delay. If other filter is selected, it will wait for 1.5 seconds before calling the api
    const delayDebounceFn = setTimeout(() => {
      getInventoryInfo();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);


  const getUserInfo = async () => {
    try {
      const response = await getUser(id);
      setUser(response);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const getInventoryInfo = async (newPage?: boolean) => {
    try {
      const response = await getInventory(
        id,
        newPage ? inventory && inventory.currentPage + 1 : 1,
        filters
      );
      setInventory(response);
      newPage
        ? setInvItems((prev) => [...prev, ...response.items])
        : setInvItems(response.items);
    } catch (error) {
      console.log(error);
    }
    setLoadingInventory(false);
  };


  useEffect(() => {
    if (userData) {
      if (userData.id == id) {
        setIsSameUser(true);
      }
    }
  }, [userData]);

  useEffect(() => {
    if (refresh) {
      getUserInfo();
      getInventoryInfo();
      setRefresh(false);
    }
  }, [refresh]);


  return (
    <div className="flex flex-col items-center w-screen">
      <div className="flex flex-col max-w-[1312px] py-4 w-full">
        {loading ? (
          <div className="flex items-center justify-start pb-7">
            <Skeleton
              circle={true}
              height={144}
              width={144}
              highlightColor="#161427"
              baseColor="#1c1a31"
            />
          </div>
        ) : (
          user && (
            <UserInfo
              user={user}
              isSameUser={isSameUser}
              setRefresh={setRefresh}
            />
          )
        )}
      </div>

      <div className="flex flex-col items-center w-full bg-[#141225] min-h-screen">
        <div className="flex flex-col p-8 gap-2 items-center w-full max-w-[1312px]">
          <h2 className="text-2xl font-bold py-4 ">Inventory</h2>
          <div className="flex flex-col w-full items-end mr-[70px] gap-4 -mt-10">
            <div onClick={() => setOpenFilters(!openFilters)} className="border p-2 rounded-md cursor-pointer"><FiFilter className="text-2xl " />
            </div>
            {openFilters && <Filters filters={filters} setFilters={setFilters} />}

          </div>
          <div className="flex flex-wrap gap-6  justify-center ">
            {loadingInventory ? (
              { array: Array(12).fill(0) }.array.map((_, i) => (
                <Skeleton
                  width={176}
                  height={216}
                  highlightColor="#161427"
                  baseColor="#1c1a31"
                  key={i}
                />
              ))
            ) : invItems && Object.keys(invItems).length > 0 ? (
              invItems.map((item: any, i: number) => (
                <Item
                  item={item}
                  key={item.name + i}
                  fixable={isSameUser}
                  setRefresh={setRefresh}
                />
              ))
            ) : (
              <h2>No items</h2>
            )}
          </div>
          {inventory &&
            inventory.currentPage !== inventory.totalPages &&
            invItems.length > 19 && (
              <div className="w-40 mt-4">
                <MainButton
                  text={`Load more`}
                  onClick={() => getInventoryInfo(true)}
                  loading={loadingInventory}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;