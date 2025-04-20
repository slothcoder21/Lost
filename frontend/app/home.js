import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ItemCard from '../components/ItemCard';
import FilterModal from '../components/FilterModal';
import ItemDetailModal from '../components/ItemDetailModal';

export default function HomePage() {
  const router = useRouter();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // Prevent back navigation to login/register screens
  useEffect(() => {
    // This effect triggers when the home screen mounts
    // The navigation stack should already be reset by the router.replace
    // or by the gestureEnabled: false option in _layout.js
    
    // This is an additional safety measure to disable hardware back button
    // on Android if needed in the future
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  // Mock data for the items list
  const items = [
    {
      id: 1,
      title: 'Water Bottle',
      image: require('../assets/item-images/water-bottle.png'), // We'll use a placeholder for now
      description: 'Blue metal water bottle with a sticker on the side. Found near the library.',
      foundBy: {
        name: 'John Doe',
        image: require('../assets/profile-photos/johnDoe.png'), // Placeholder for profile image
      },
      location: 'Davis, CA',
      date: new Date('2024-10-15'),
      status: 'Lost',
    },
    {
      id: 2,
      title: 'UC Davis ID',
      image: require('../assets/item-images/ID.png'),
      description: 'UC Davis ID card with a sticker on the side. Found near the Memorial Union.',
      foundBy: {
        name: 'Jane Doe',
        image: require('../assets/profile-photos/janeDoe.png'),
      },
      location: 'Davis, CA',
      date: new Date('2023-11-20'),
      status: 'Found',
    },
    {
      id: 3,
      title: 'Backpack',
      image: require('../assets/item-images/backpack.png'),
      description: 'Black backpack with red trim. Found at Library with some notebooks and pens.',
      foundBy: {
        name: 'Andrew Lam',
        image: require('../assets/profile-photos/andrew.png'),
      },
      location: 'Davis, CA',
      date: new Date('2023-12-05'),
      status: 'Lost',
    },
    {
      id: 4,
      title: 'Pencil',
        image: require('../assets/item-images/pencils.png'),
      description: 'Mechanical pencil with blue grip. Found at Wellman Hall.',
      foundBy: {
        name: 'Justin So',
        image: require('../assets/profile-photos/justin.png'),
      },
      location: 'Davis, CA',
      date: new Date('2025-01-13'),
      status: 'Found',
    },
    {
      id: 5,
      title: 'Airpods',
        image: require('../assets/item-images/airpods.png'),
      description: 'Airpods with a sticker on the side. Found at the TLC.',
      foundBy: {
        name: 'Davis Police Department',
        image: require('../assets/profile-photos/davisPolice.png'),
      },
      location: 'Davis, CA',
      date: new Date('2025-04-20'),
      status: 'Found',
    },
    {
      id: 6,
      title: 'IPhone',
      image: require('../assets/item-images/iphone.png'), // Reusing an image as placeholder
      description: 'Purple IPhone. Lost near the student center.',
      foundBy: {
        name: 'You', // This is the user's own post
        image: require('../assets/profile-photo.png'),
      },
      location: 'Davis, CA',
      date: new Date('2025-05-01'),
      status: 'Lost',
      postedByUser: true, // Flag to indicate this was posted by the current user
    },
  ];

  // Initialize filtered items with all items on component mount
  useEffect(() => {
    setFilteredItems(items);
  }, []);

  useEffect(() => {
    // Apply filter when it changes
    applyFilter();
  }, [appliedFilter]);

  const applyFilter = () => {
    let filtered = [];
    
    if (!appliedFilter) {
      // No filter applied, show all items
      filtered = [...items];
    } else if (appliedFilter.type === 'keyword') {
      // Filter by keyword
      const keyword = appliedFilter.value.toLowerCase();
      filtered = items.filter(item => 
        item.title.toLowerCase().includes(keyword) || 
        item.foundBy.name.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword) ||
        (item.status && item.status.toLowerCase().includes(keyword))
      );
    } else if (appliedFilter.type === 'date') {
      // Filter by date
      const filterDate = appliedFilter.value;
      if (filterDate) {
        filtered = items.filter(item => {
          // Compare only year, month, day
          return item.date.getFullYear() === filterDate.getFullYear() &&
                 item.date.getMonth() === filterDate.getMonth() &&
                 item.date.getDate() === filterDate.getDate();
        });
      } else {
        filtered = [...items];
      }
    } else if (appliedFilter.type === 'status') {
      // Filter by status (Lost or Found)
      const status = appliedFilter.value;
      filtered = items.filter(item => item.status === status);
    } else {
      filtered = [...items];
    }

    // Apply sorting if a sort option is selected
    if (appliedFilter && appliedFilter.sort) {
      switch (appliedFilter.sort) {
        case 'dateAsc':
          // Sort by date (oldest first)
          filtered.sort((a, b) => a.date - b.date);
          break;
        case 'dateDesc':
          // Sort by date (newest first)
          filtered.sort((a, b) => b.date - a.date);
          break;
        case 'alphaAsc':
          // Sort alphabetically A-Z
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'alphaDesc':
          // Sort alphabetically Z-A
          filtered.sort((a, b) => b.title.localeCompare(a.title));
          break;
      }
    }

    setFilteredItems(filtered);
  };

  const handleApplyFilter = (filter) => {
    setAppliedFilter(filter);
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
  };

  const handleClaimItem = (item) => {
    // Close the modal and navigate to chat with the item's user ID
    setDetailModalVisible(false);
    
    // When claiming an item, add verification parameter to indicate verification is needed
    if (item.status === 'Found') {
      router.push(`/chat?userId=user-${item.id}&verification=true`);
    } else {
      // For lost items, just go to regular chat
      router.push(`/chat?userId=user-${item.id}`);
    }
  };

  const goToChats = () => {
    router.push('/chats');
  };

  const goToProfile = () => {
    router.push('/profile');
  };
  
  const goToListItem = () => {
    router.push('/list-item');
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!filterModalVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {/* Left side - Message and Filter icons */}
          <View style={styles.headerLeftIcons}>
            <TouchableOpacity style={styles.headerIcon} onPress={goToChats}>
              <View style={styles.iconContainer}>
                <Ionicons name="chatbubble-outline" size={28} color="black" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerIcon} onPress={toggleFilterModal}>
              <View style={styles.iconContainer}>
                <Ionicons name="filter-outline" size={28} color="black" />
                {appliedFilter && (
                  <View style={styles.filterIndicator} />
                )}
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Center - Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Right side - profile picture */}
          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.profilePic} onPress={goToProfile}>
              <Image 
                source={require('../assets/profile-photo.png')}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Location bar */}
        <View style={styles.locationBar}>
          <Text style={styles.locationLabel}>Location:</Text>
          <Text style={styles.locationValue}>Davis, CA</Text>
        </View>

        {/* Filter indicator */}
        {appliedFilter && (
          <View style={styles.activeFilterBar}>
            <Text style={styles.activeFilterText}>
              {appliedFilter.type === 'keyword' 
                ? `Filtered by: "${appliedFilter.value}"`
                : `Filtered by date: ${appliedFilter.value.toLocaleDateString()}`
              }
              {appliedFilter.sort && (
                <>
                  {' • '}
                  {appliedFilter.sort === 'dateAsc' && 'Sorted by: Date (Oldest first)'}
                  {appliedFilter.sort === 'dateDesc' && 'Sorted by: Date (Newest first)'}
                  {appliedFilter.sort === 'alphaAsc' && 'Sorted by: A-Z'}
                  {appliedFilter.sort === 'alphaDesc' && 'Sorted by: Z-A'}
                </>
              )}
            </Text>
            <TouchableOpacity onPress={() => setAppliedFilter(null)}>
              <Ionicons name="close-circle" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content - List of Lost Items */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onPress={handleItemPress}
              />
            ))
          ) : (
            <View style={styles.noItemsContainer}>
              <Text style={styles.noItemsText}>No items found matching your filter.</Text>
            </View>
          )}
        </ScrollView>
        
        {/* Floating Action Button for adding a new item */}
        <TouchableOpacity style={styles.fab} onPress={goToListItem}>
          <Ionicons name="add" size={30} color="#000000" />
        </TouchableOpacity>

        {/* Filter Modal */}
        <FilterModal
          visible={filterModalVisible}
          onClose={toggleFilterModal}
          onApplyFilter={handleApplyFilter}
        />

        {/* Item Detail Modal */}
        <ItemDetailModal
          visible={detailModalVisible}
          item={selectedItem}
          onClose={handleCloseDetailModal}
          onClaim={handleClaimItem}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light gray background
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5', // Gray header to match background
    position: 'relative', // Ensure positioning context for absolute elements
  },
  headerLeftIcons: {
    flexDirection: 'row',
    width: 90, // Fixed width to match the right side
    justifyContent: 'flex-start',
    zIndex: 2, // Ensure buttons are above logo
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Changed from -1 to 1 to ensure the logo is visible
  },
  logo: {
    width: 42,
    height: 42,
  },
  profilePic: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  locationBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
  },
  locationLabel: {
    color: 'black',
    fontSize: 14,
    fontWeight: '400',
    marginRight: 4,
  },
  locationValue: {
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 8,
    backgroundColor: '#E6F7ED',
    borderRadius: 10,
    flexWrap: 'wrap',
  },
  activeFilterText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10, // Add some padding at the top
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#8AD3A3',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f44336',
  },
  noItemsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noItemsText: {
    fontSize: 16,
    color: '#666',
  },
  headerRightIcons: {
    flexDirection: 'row',
    width: 90, // Fixed width to match the left side
    justifyContent: 'flex-end',
    zIndex: 2, // Ensure buttons are above logo
  },
}); 