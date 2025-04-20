import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  Animated,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function FilterModal({ visible, onClose, onApplyFilter }) {
  const [searchText, setSearchText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(null);
  const [filterType, setFilterType] = useState('keyword'); // 'keyword', 'date', or 'status'
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(350)).current;
  const [sortOption, setSortOption] = useState(null); // null, 'dateAsc', 'dateDesc', 'alphaAsc', 'alphaDesc'
  const [selectedStatus, setSelectedStatus] = useState(null); // null, 'Lost', 'Found'

  useEffect(() => {
    // Animation for modal visibility
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 350,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  useEffect(() => {
    // Set up keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleDateChange = (selectedDate) => {
    setShowDatePicker(false);
    setDate(selectedDate);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleApplyFilter = () => {
    onApplyFilter({
      type: filterType,
      value: filterType === 'keyword' ? searchText : filterType === 'date' ? date : selectedStatus,
      sort: sortOption
    });
    onClose();
  };

  const handleClearFilter = () => {
    setSearchText('');
    setDate(null);
    setSortOption(null);
    setSelectedStatus(null);
    onApplyFilter(null);
    onClose();
  };

  const handleSwitchToKeyword = () => {
    setFilterType('keyword');
  };

  const handleSwitchToDate = () => {
    setFilterType('date');
  };

  const handleSwitchToStatus = () => {
    setFilterType('status');
  };

  const selectSortOption = (option) => {
    setSortOption(option === sortOption ? null : option);
  };

  const selectStatus = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <Animated.View 
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: slideAnim }] }
                ]}
              >
                <View style={styles.dragIndicatorContainer}>
                  <View style={styles.dragIndicator} />
                </View>
                
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filter & Sort Items</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.filterTypeSelector}>
                  <TouchableOpacity 
                    style={[
                      styles.filterTypeButton, 
                      filterType === 'keyword' && styles.activeFilterType
                    ]}
                    onPress={handleSwitchToKeyword}
                  >
                    <Text style={styles.filterTypeText}>Keyword</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.filterTypeButton, 
                      filterType === 'date' && styles.activeFilterType
                    ]}
                    onPress={handleSwitchToDate}
                  >
                    <Text style={styles.filterTypeText}>Date</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.filterTypeButton, 
                      filterType === 'status' && styles.activeFilterType
                    ]}
                    onPress={handleSwitchToStatus}
                  >
                    <Text style={styles.filterTypeText}>Status</Text>
                  </TouchableOpacity>
                </View>

                {filterType === 'keyword' ? (
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search by keywords..."
                      value={searchText}
                      onChangeText={setSearchText}
                    />
                    {searchText ? (
                      <TouchableOpacity onPress={() => setSearchText('')}>
                        <Ionicons name="close-circle" size={20} color="#666" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : filterType === 'date' ? (
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>Select Date:</Text>
                    <TouchableOpacity 
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateText}>
                        {date ? date.toLocaleDateString() : 'Select a date'}
                      </Text>
                      <Ionicons name="calendar" size={20} color="#666" />
                    </TouchableOpacity>
                    
                    <DateTimePickerModal
                      isVisible={showDatePicker}
                      mode="date"
                      onConfirm={handleDateChange}
                      onCancel={handleDateCancel}
                      date={date || new Date()}
                      textColor="#000" // Explicitly set the text color for dates
                      isDarkModeEnabled={false} // Force light mode for the picker
                    />
                  </View>
                ) : (
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Select Status:</Text>
                    <View style={styles.statusOptionsContainer}>
                      <TouchableOpacity 
                        style={[
                          styles.statusOption, 
                          selectedStatus === 'Lost' && styles.lostStatusSelected
                        ]}
                        onPress={() => selectStatus('Lost')}
                      >
                        <Text style={[
                          styles.statusOptionText,
                          selectedStatus === 'Lost' && styles.statusSelectedText
                        ]}>Lost</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.statusOption, 
                          selectedStatus === 'Found' && styles.foundStatusSelected
                        ]}
                        onPress={() => selectStatus('Found')}
                      >
                        <Text style={[
                          styles.statusOptionText,
                          selectedStatus === 'Found' && styles.statusSelectedText
                        ]}>Found</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Sort options */}
                <View style={styles.sortSection}>
                  <Text style={styles.sectionTitle}>Sort By:</Text>
                  
                  <View style={styles.sortOptionsContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.sortOption, 
                        sortOption === 'dateAsc' && styles.activeSortOption
                      ]}
                      onPress={() => selectSortOption('dateAsc')}
                    >
                      <Ionicons 
                        name="calendar-outline" 
                        size={16} 
                        color={sortOption === 'dateAsc' ? '#FFFFFF' : '#555'} 
                      />
                      <Ionicons 
                        name="arrow-up" 
                        size={14} 
                        color={sortOption === 'dateAsc' ? '#FFFFFF' : '#555'} 
                        style={{marginLeft: 4}}
                      />
                      <Text style={[
                        styles.sortOptionText,
                        sortOption === 'dateAsc' && styles.activeSortOptionText
                      ]}>
                        Date (Oldest)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[
                        styles.sortOption, 
                        sortOption === 'dateDesc' && styles.activeSortOption
                      ]}
                      onPress={() => selectSortOption('dateDesc')}
                    >
                      <Ionicons 
                        name="calendar-outline" 
                        size={16} 
                        color={sortOption === 'dateDesc' ? '#FFFFFF' : '#555'} 
                      />
                      <Ionicons 
                        name="arrow-down" 
                        size={14} 
                        color={sortOption === 'dateDesc' ? '#FFFFFF' : '#555'} 
                        style={{marginLeft: 4}}
                      />
                      <Text style={[
                        styles.sortOptionText,
                        sortOption === 'dateDesc' && styles.activeSortOptionText
                      ]}>
                        Date (Newest)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[
                        styles.sortOption, 
                        sortOption === 'alphaAsc' && styles.activeSortOption
                      ]}
                      onPress={() => selectSortOption('alphaAsc')}
                    >
                      <Ionicons 
                        name="text-outline" 
                        size={16} 
                        color={sortOption === 'alphaAsc' ? '#FFFFFF' : '#555'} 
                      />
                      <Ionicons 
                        name="arrow-up" 
                        size={14} 
                        color={sortOption === 'alphaAsc' ? '#FFFFFF' : '#555'} 
                        style={{marginLeft: 4}}
                      />
                      <Text style={[
                        styles.sortOptionText,
                        sortOption === 'alphaAsc' && styles.activeSortOptionText
                      ]}>
                        A-Z
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[
                        styles.sortOption, 
                        sortOption === 'alphaDesc' && styles.activeSortOption
                      ]}
                      onPress={() => selectSortOption('alphaDesc')}
                    >
                      <Ionicons 
                        name="text-outline" 
                        size={16} 
                        color={sortOption === 'alphaDesc' ? '#FFFFFF' : '#555'} 
                      />
                      <Ionicons 
                        name="arrow-down" 
                        size={14} 
                        color={sortOption === 'alphaDesc' ? '#FFFFFF' : '#555'} 
                        style={{marginLeft: 4}}
                      />
                      <Text style={[
                        styles.sortOptionText,
                        sortOption === 'alphaDesc' && styles.activeSortOptionText
                      ]}>
                        Z-A
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={handleClearFilter}
                  >
                    <Text style={styles.clearButtonText}>Clear</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.applyButton} 
                    onPress={handleApplyFilter}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  dragIndicatorContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterTypeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  filterTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeFilterType: {
    backgroundColor: '#8AD3A3',
  },
  filterTypeText: {
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingVertical: 10,
  },
  dateContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  dateText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  sortSection: {
    marginBottom: 20,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
  },
  activeSortOption: {
    backgroundColor: '#8AD3A3',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  activeSortOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  clearButtonText: {
    fontWeight: '500',
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#8AD3A3',
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  applyButtonText: {
    fontWeight: '500',
    color: 'white',
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  statusOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
  },
  statusOptionText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  lostStatusSelected: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)', // Red for lost items
  },
  foundStatusSelected: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)', // Green for found items
  },
  statusSelectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 