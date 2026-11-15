export type Language = "EN" | "DE";

export interface DashboardTranslations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    search: string;
    filter: string;
    all: string;
    status: string;
    actions: string;
    viewDetails: string;
    close: string;
    back: string;
    loading: string;
    success: string;
    error: string;
    confirm: string;
    active: string;
    inactive: string;
    pending: string;
    confirmed: string;
    completed: string;
    cancelled: string;
    blocked: string;
    unblock: string;
    block: string;
    showing: string;
    to: string;
    of: string;
    results: string;
    previous: string;
    next: string;
    noDataFound: string;
    yes: string;
    no: string;
  };
  nav: {
    dashboard: string;
    customers: string;
    providers: string;
    bookings: string;
    users: string;
    admins: string;
    earnings: string;
    subscription: string;
    reports: string;
    products: string;
    categories: string;
    chatgptOversight: string;
    identityVerification: string;
    platformCustomization: string;
    settings: string;
    logout: string;
    logoutConfirmTitle: string;
    logoutConfirmDesc: string;
  };
  header: {
    welcome: string;
    haveANiceDay: string;
    notifications: string;
    profile: string;
    language: string;
    english: string;
    german: string;
  };
  dashboard: {
    totalRevenue: string;
    totalUsers: string;
    totalBookings: string;
    activeProviders: string;
    overviewTitle: string;
    overviewSubtitle: string;
    recentUsers: string;
    userRatio: string;
    quickStats: string;
    marketplaceGrossVolume: string;
    activeBuyersSellers: string;
    inspectedAiListings: string;
    aiNegotiations: string;
    operationsTitle: string;
    operationsSubtitle: string;
    manageBookings: string;
    viewProviders: string;
    financialReports: string;
  };
  recentUsers: {
    title: string;
    sId: string;
    fullName: string;
    email: string;
    phoneNo: string;
    userType: string;
    joinedDate: string;
    action: string;
    blockUser: string;
    viewDetails: string;
    noUsersFound: string;
  };
  charts: {
    userRatioTitle: string;
    userRatioDescription: string;
    userRatio: string;
    selectYear: string;
    usersLabel: string;
    users: string;
    monthlyRevenue: string;
    revenueVsTarget: string;
    productCategories: string;
    products: string;
    productsPerCategory: string;
    distributionProducts: string;
    earnings: string;
    earningsOverview: string;
    earningsDesc: string;
    trendingUp: string;
    jan: string;
    feb: string;
    mar: string;
    apr: string;
    may: string;
    jun: string;
    jul: string;
    aug: string;
    sep: string;
    oct: string;
    nov: string;
    dec: string;
    months: Record<string, string>;
  };
  admins: {
    title: string;
    searchPlaceholder: string;
    createAdmin: string;
    blockedAdmins: string;
    fullName: string;
    email: string;
    phoneNo: string;
    adminType: string;
    joinedDate: string;
    action: string;
    editAdmin: string;
    blockAdmin: string;
    unblockAdmin: string;
    deleteAdmin: string;
    viewDetails: string;
    noAdminsFound: string;
    createAdminTitle: string;
    editAdminTitle: string;
    blockAdminTitle: string;
    blockAdminConfirm: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    roleLabel: string;
    selectRole: string;
    saveAdmin: string;
    editModal: {
      title: string;
      name: string;
      email: string;
      role: string;
      selectRole: string;
      profileImage: string;
      uploadImage: string;
      cancel: string;
      save: string;
      errors: {
        nameRequired: string;
        roleRequired: string;
      };
    };
    blockModal: {
      title: string;
      desc: string;
      cancel: string;
      confirm: string;
    };
    createModal: {
      title: string;
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      newPassword: string;
      confirmPassword: string;
      profileImage: string;
      uploadImage: string;
      submit: string;
      errors: {
        nameRequired: string;
        emailRequired: string;
        invalidEmail: string;
        passwordRequired: string;
        passwordMin: string;
        confirmRequired: string;
        passwordMismatch: string;
      };
    };
    tableHeaders: {
      no: string;
      adminName: string;
      role: string;
      phoneNumber: string;
      joinedDate: string;
      email: string;
      action: string;
    };
    actions: {
      editAdmin: string;
      blockAdmin: string;
      viewDetails: string;
    };
    blocked: string;
    showing: string;
    to: string;
    of: string;
    adminsCount: string;
  };
  users: {
    title: string;
    searchPlaceholder: string;
    blockedUsers: string;
    fullName: string;
    email: string;
    phoneNo: string;
    joinedDate: string;
    action: string;
    blockUser: string;
    viewDetails: string;
    noUsersFound: string;
    userDetailsTitle: string;
    blockedUsersTitle: string;
    unblockUser: string;
    blocked: string;
    clients: string;
    providers: string;
    showing: string;
    to: string;
    of: string;
    usersCount: string;
    tableHeaders: {
      no: string;
      userName: string;
      phoneNumber: string;
      joinedDate: string;
      email: string;
      action: string;
    };
    actions: {
      blockUser: string;
      viewDetails: string;
    };
    detailsModal: {
      title: string;
      email: string;
      phone: string;
      userType: string;
      joinedDate: string;
      close: string;
      blockUser: string;
    };
    blockedModal: {
      title: string;
      noBlocked: string;
      noBlockedDesc: string;
      unblock: string;
      deletePermanently: string;
      close: string;
      confirmDeleteTitle: string;
      confirmDeleteDesc: string;
      cancel: string;
      delete: string;
    };
  };
  blogs: {
    title: string;
    searchPlaceholder: string;
    createBlog: string;
    imageTitle: string;
    author: string;
    category: string;
    date: string;
    actions: {
      viewBlog: string;
      deleteBlog: string;
    };
    viewBlog: string;
    deleteBlog: string;
    noBlogsFound: string;
    createBlogTitle: string;
    blogTitleLabel: string;
    blogTitlePlaceholder: string;
    authorLabel: string;
    authorPlaceholder: string;
    categoryLabel: string;
    contentLabel: string;
    contentPlaceholder: string;
    blogDetailsTitle: string;
    deleteBlogTitle: string;
    deleteBlogConfirm: string;
    deleteConfirm: string;
    by: string;
    showing: string;
    to: string;
    of: string;
    blogsCount: string;
    tableHeaders: {
      no: string;
      title: string;
      author: string;
      category: string;
      createdDate: string;
      action: string;
    };
    createModal: {
      title: string;
      blogTitle: string;
      blogTitlePlaceholder: string;
      author: string;
      authorPlaceholder: string;
      category: string;
      categoryPlaceholder: string;
      content: string;
      cancel: string;
      submit: string;
      errors: {
        titleRequired: string;
        authorRequired: string;
        categoryRequired: string;
        contentRequired: string;
      };
    };
  };
  category: {
    title: string;
    searchPlaceholder: string;
    addCategory: string;
    categoryName: string;
    subcategories: string;
    createdDate: string;
    actions: {
      editCategory: string;
      deleteCategory: string;
    };
    editCategory: string;
    deleteCategory: string;
    noCategoriesFound: string;
    createCategoryTitle: string;
    editCategoryTitle: string;
    deleteCategoryTitle: string;
    deleteCategoryConfirm: string;
    categoryNameLabel: string;
    categoryNamePlaceholder: string;
    subcategoriesLabel: string;
    subcategoriesPlaceholder: string;
    createModal: {
      title: string;
      categoryName: string;
      categoryNamePlaceholder: string;
      subCategories: string;
      subCategoryPlaceholder: string;
      addSubCategory: string;
      cancel: string;
      submit: string;
      errors: {
        nameRequired: string;
      };
    };
    editModal: {
      title: string;
      categoryName: string;
      categoryNamePlaceholder: string;
      subCategories: string;
      subCategoryPlaceholder: string;
      addSubCategory: string;
      cancel: string;
      save: string;
      errors: {
        nameRequired: string;
      };
    };
    deleteModal: {
      title: string;
      desc: string;
      cancel: string;
      delete: string;
    };
    tableHeaders: {
      no: string;
      category: string;
      categoryName: string;
      subcategories: string;
      subCategories: string;
      createdDate: string;
      actions: string;
      action: string;
    };
    more: string;
    showing: string;
    to: string;
    of: string;
    categoriesCount: string;
  };
  chats: {
    title: string;
    searchPlaceholder: string;
    typeMessage: string;
    send: string;
    noConversationSelected: string;
    selectToChat: string;
    selectToStart: string;
    you: string;
    unknown: string;
  };
  earnings: {
    title: string;
    subtitle: string;
    averageTransaction: string;
    avgTransaction: string;
    currentMonthRevenue: string;
    totalRevenue: string;
    recentTransactions: string;
    transactionId: string;
    date: string;
    description: string;
    type: string;
    amount: string;
    status: string;
    filterYear: string;
    yearLabel: string;
    transactionsCount: string;
    saleType: string;
    serviceType: string;
    recurringType: string;
    refundType: string;
  };
  notifications: {
    title: string;
    markAllRead: string;
    readAll: string;
    noNotifications: string;
    viewAll: string;
    mark: string;
    allNotifications: string;
  };
  profile: {
    title: string;
    subtitle: string;
    profileDetails: string;
    fullName: string;
    fullNamePlaceholder: string;
    emailAddress: string;
    emailPlaceholder: string;
    phoneNumber: string;
    phonePlaceholder: string;
    changeAvatarText: string;
    saveChanges: string;
    nameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    phoneRequired: string;
    updateSuccess: string;
  };
  reports: {
    title: string;
    loading: string;
    user: string;
    consultant: string;
    reason: string;
    date: string;
    status: {
      pending: string;
      reviewed: string;
      resolved: string;
    };
    actions: {
      markReviewed: string;
      resolve: string;
    };
    tableHeaders: {
      user: string;
      consultant: string;
      reason: string;
      date: string;
      status: string;
      actions: string;
    };
    markReviewed: string;
    resolve: string;
    noReportsFound: string;
    loadingReports: string;
    pendingStatus: string;
    reviewedStatus: string;
    resolvedStatus: string;
  };
  subscription: {
    title: string;
    manageSubscriptions: string;
    managePlans: string;
    month: string;
    year: string;
    bestValue: string;
    saveAmount: string;
    subscribedUsers: string;
    userName: string;
    email: string;
    startDate: string;
    nextBilling: string;
    active: string;
    cancelled: string;
    usersText: string;
    monthlyPlanTitle: string;
    yearlyPlanTitle: string;
    perMonth: string;
    perYear: string;
    features: string;
    subscribersList: string;
    user: string;
    plan: string;
    amount: string;
    billingCycle: string;
    status: string;
    renewalDate: string;
    modalTitle: string;
    planNameLabel: string;
    priceLabel: string;
    billingCycleLabel: string;
    featuresLabel: string;
    addFeature: string;
  };
  customers: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allTab: string;
    activeTab: string;
    blockedTab: string;
    totalBookings: string;
    totalSpent: string;
    viewProfile: string;
    blockCustomer: string;
    unblockCustomer: string;
    createBooking: string;
    name: string;
    email: string;
    phone: string;
    joined: string;
    noCustomersFound: string;
    customerDetailsTitle: string;
    customerProfile: string;
    bookingHistory: string;
    newBookingTitle: string;
    serviceName: string;
    provider: string;
    date: string;
    time: string;
    amount: string;
  };
  providers: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allTab: string;
    companyTab: string;
    personalTab: string;
    services: string;
    rating: string;
    verified: string;
    unverified: string;
    addService: string;
    viewDetails: string;
    businessName: string;
    contactPerson: string;
    category: string;
    noProvidersFound: string;
    providerDetailsTitle: string;
    servicesOffered: string;
    hourlyRate: string;
    duration: string;
    newServiceTitle: string;
    newServiceDesc: string;
    serviceTitleLabel: string;
    categoryLabel: string;
    priceLabel: string;
    durationLabel: string;
    descriptionLabel: string;
    imageUrlLabel: string;
  };
  bookings: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allTab: string;
    pendingTab: string;
    confirmedTab: string;
    completedTab: string;
    cancelledTab: string;
    customer: string;
    provider: string;
    service: string;
    date: string;
    time: string;
    amount: string;
    status: string;
    changeStatus: string;
    viewDetails: string;
    noBookingsFound: string;
    bookingDetailsTitle: string;
    address: string;
    notes: string;
    updateStatusSuccess: string;
  };
  products: {
    title: string;
    subtitle: string;
    inspectorLive: string;
    totalListings: string;
    approvedLive: string;
    underReviewFlagged: string;
    completedSold: string;
    allTab: string;
    liveTab: string;
    underReviewTab: string;
    soldTab: string;
    searchPlaceholder: string;
    productImage: string;
    category: string;
    seller: string;
    priceFloor: string;
    aiPhotoScore: string;
    status: string;
    actions: string;
    inspectDetails: string;
    approveListing: string;
    flagListing: string;
    deleteListing: string;
    noListingsFound: string;
    detailsModalTitle: string;
    aiInspectionDetails: string;
    detectedType: string;
    detectedColor: string;
    lightingStatus: string;
    angleAdvice: string;
    rulesAndTerms: string;
    floorPrice: string;
    shippingTerms: string;
    returnPolicy: string;
    customFaq: string;
  };
  chatgptOversight: {
    title: string;
    subtitle: string;
    sentryLive: string;
    totalNegotiations: string;
    sessions: string;
    dealsAccepted: string;
    rate: string;
    offersDeclined: string;
    belowFloor: string;
    platformDiscountCap: string;
    protected: string;
    rulesTitle: string;
    rulesSubtitle: string;
    rulesSaved: string;
    maxDiscountLabel: string;
    maxDiscountHint: string;
    forbiddenKeywordsLabel: string;
    forbiddenKeywordsHint: string;
    aiStatusLabel: string;
    aiActiveGlobally: string;
    aiPaused: string;
    saveRules: string;
    logsTitle: string;
    logsSubtitle: string;
    allFilter: string;
    acceptedFilter: string;
    rejectedFilter: string;
    searchLogs: string;
    productCol: string;
    buyerSellerCol: string;
    offerFinalCol: string;
    statusCol: string;
    timestampCol: string;
    rationaleCol: string;
    sellerPrefix: string;
    dealPrefix: string;
    noDeal: string;
  };
  platformCustomization: {
    title: string;
    subtitle: string;
    savedSuccess: string;
    identityTitle: string;
    platformTitleLabel: string;
    accentColorLabel: string;
    logoLabel: string;
    defaultLogoActive: string;
    logoOptimized: string;
    aiCategoriesTitle: string;
    aiCategoriesSubtitle: string;
    aiCategoriesLabel: string;
    legalPoliciesTitle: string;
    escrowTermsLabel: string;
    aiFaqLabel: string;
    saveChanges: string;
  };
  auth: {
    welcomeBack: string;
    signInPrompt: string;
    emailAddress: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    signIn: string;
    emailRequired: string;
    validEmailRequired: string;
    passwordRequired: string;
    passwordMinLength: string;
    forgotPasswordTitle: string;
    forgotPasswordSubtitle: string;
    sendResetLink: string;
    backToSignIn: string;
    verifyOtpTitle: string;
    verifyOtpSubtitle: string;
    verifyOtpButton: string;
    resendOtp: string;
    resetPasswordTitle: string;
    resetPasswordSubtitle: string;
    newPassword: string;
    confirmPassword: string;
    updatePasswordButton: string;
  };
  settings: {
    title: string;
    subtitle: string;
    changePassword: string;
    privacyPolicy: string;
    termsConditions: string;
    aboutUs: string;
    languagePreference: string;
    languageDesc: string;
  };
}

export const translations: Record<Language, DashboardTranslations> = {
  EN: {
    common: {
      save: "Save Changes",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      search: "Search...",
      filter: "Filter",
      all: "All",
      status: "Status",
      actions: "Actions",
      viewDetails: "View Details",
      close: "Close",
      back: "Back",
      loading: "Loading...",
      success: "Success",
      error: "Error",
      confirm: "Confirm",
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      blocked: "Blocked",
      unblock: "Unblock",
      block: "Block",
      showing: "Showing",
      to: "to",
      of: "of",
      results: "results",
      previous: "Previous",
      next: "Next",
      noDataFound: "No records found.",
      yes: "Yes",
      no: "No",
    },
    nav: {
      dashboard: "Dashboard",
      customers: "Customers",
      providers: "Providers",
      bookings: "Bookings",
      users: "Users",
      admins: "Admins",
      earnings: "Earnings",
      subscription: "Subscriptions",
      reports: "Reports",
      products: "Products & Moderation",
      categories: "Categories",
      chatgptOversight: "Offers & Moderation",
      identityVerification: "ID Verification",
      platformCustomization: "Customization & Rules",
      settings: "Settings",
      logout: "Log Out",
      logoutConfirmTitle: "Confirm Logout",
      logoutConfirmDesc: "Are you sure you want to log out of the admin dashboard?",
    },
    header: {
      welcome: "Welcome",
      haveANiceDay: "Have a nice day!",
      notifications: "Notifications",
      profile: "Admin Profile",
      language: "Language",
      english: "English (EN)",
      german: "German (DE)",
    },
    dashboard: {
      totalRevenue: "Total Revenue",
      totalUsers: "Total Users",
      totalBookings: "Total Bookings",
      activeProviders: "Active Providers",
      overviewTitle: "Platform Overview",
      overviewSubtitle: "Real-time metrics and system activity",
      recentUsers: "Recent Users",
      userRatio: "User Ratio & Demographics",
      quickStats: "Quick Stats",
      marketplaceGrossVolume: "Marketplace Volume",
      activeBuyersSellers: "Active Buyers & Sellers",
      inspectedAiListings: "Inspected AI Listings",
      aiNegotiations: "AI Negotiations",
      operationsTitle: "Marketplace Operations & Service Dispatch",
      operationsSubtitle: "Live monitoring of client booking requests, verified provider assignments, and platform escrow payouts.",
      manageBookings: "Manage Bookings",
      viewProviders: "Verified Providers",
      financialReports: "Financial Reports",
    },
    recentUsers: {
      title: "Recent Users",
      sId: "S.ID",
      fullName: "Full Name",
      email: "Email",
      phoneNo: "Phone No",
      userType: "User Type",
      joinedDate: "Joined Date",
      action: "Action",
      blockUser: "Block User",
      viewDetails: "View Details",
      noUsersFound: "No recent users found.",
    },
    charts: {
      userRatioTitle: "User Ratio",
      userRatioDescription: "January - December",
      userRatio: "User Ratio",
      selectYear: "Select year",
      usersLabel: "Users",
      users: "Users",
      monthlyRevenue: "Monthly Revenue",
      revenueVsTarget: "Revenue vs Target",
      productCategories: "Product Categories",
      products: "Products",
      productsPerCategory: "Products Per Category",
      distributionProducts: "Distribution of products across categories",
      earnings: "Earnings",
      earningsOverview: "Earnings Overview",
      earningsDesc: "Monthly revenue performance",
      trendingUp: "Trending up this month",
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec",
      months: {
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December",
      },
    },
    admins: {
      title: "Admin List",
      searchPlaceholder: "Search Admin by name, email or role...",
      createAdmin: "Create Admin",
      blockedAdmins: "Blocked",
      fullName: "Full Name",
      email: "Email",
      phoneNo: "Phone No",
      adminType: "Admin Type",
      joinedDate: "Joined Date",
      action: "Action",
      editAdmin: "Edit Admin",
      blockAdmin: "Block Admin",
      unblockAdmin: "Unblock Admin",
      deleteAdmin: "Delete Admin",
      viewDetails: "View Details",
      noAdminsFound: "No administrators found.",
      createAdminTitle: "Create New Admin",
      editAdminTitle: "Edit Administrator",
      blockAdminTitle: "Block Administrator",
      blockAdminConfirm: "Are you sure you want to block this administrator? They will immediately lose dashboard access.",
      nameLabel: "Full Name",
      namePlaceholder: "e.g. Alexander Weber",
      emailLabel: "Email Address",
      emailPlaceholder: "admin@odaboo.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      roleLabel: "Admin Role",
      selectRole: "Select Role",
      saveAdmin: "Save Administrator",
      editModal: {
        title: "Edit Administrator",
        name: "Name",
        email: "Email",
        role: "Role",
        selectRole: "Select Role",
        profileImage: "Profile Image",
        uploadImage: "Upload Image",
        cancel: "Cancel",
        save: "Save Changes",
        errors: {
          nameRequired: "Name is required",
          roleRequired: "Please select a role",
        },
      },
      blockModal: {
        title: "Block Administrator",
        desc: "Are you sure you want to block this admin? They will lose dashboard access immediately.",
        cancel: "Cancel",
        confirm: "Block Admin",
      },
      createModal: {
        title: "Create New Admin",
        name: "Name",
        namePlaceholder: "e.g. John Doe",
        email: "Email",
        emailPlaceholder: "admin@example.com",
        newPassword: "Password",
        confirmPassword: "Confirm Password",
        profileImage: "Profile Image",
        uploadImage: "Upload Image",
        submit: "Create Admin",
        errors: {
          nameRequired: "Name is required",
          emailRequired: "Email is required",
          invalidEmail: "Please enter a valid email address",
          passwordRequired: "Password is required",
          passwordMin: "Password must be at least 6 characters",
          confirmRequired: "Please confirm your password",
          passwordMismatch: "Passwords do not match",
        },
      },
      tableHeaders: {
        no: "No",
        adminName: "Admin Name",
        role: "Role",
        phoneNumber: "Phone Number",
        joinedDate: "Joined Date",
        email: "Email",
        action: "Action",
      },
      actions: {
        editAdmin: "Edit Admin",
        blockAdmin: "Block Admin",
        viewDetails: "View Details",
      },
      blocked: "Blocked",
      showing: "Showing",
      to: "to",
      of: "of",
      adminsCount: "admins",
    },
    users: {
      title: "User List",
      searchPlaceholder: "Search User by name, email or phone...",
      blockedUsers: "Blocked",
      fullName: "Full Name",
      email: "Email",
      phoneNo: "Phone No",
      joinedDate: "Joined Date",
      action: "Action",
      blockUser: "Block User",
      viewDetails: "View Details",
      noUsersFound: "No users found.",
      userDetailsTitle: "User Profile Details",
      blockedUsersTitle: "Blocked Users List",
      unblockUser: "Unblock User",
      blocked: "Blocked",
      clients: "Clients",
      providers: "Providers",
      showing: "Showing",
      to: "to",
      of: "of",
      usersCount: "users",
      tableHeaders: {
        no: "No",
        userName: "User Name",
        phoneNumber: "Phone Number",
        joinedDate: "Joined Date",
        email: "Email",
        action: "Action",
      },
      actions: {
        blockUser: "Block User",
        viewDetails: "View Details",
      },
      detailsModal: {
        title: "User Details",
        email: "Email Address",
        phone: "Phone Number",
        userType: "User Type",
        joinedDate: "Joined Date",
        close: "Close",
        blockUser: "Block User",
      },
      blockedModal: {
        title: "Blocked Users ({count})",
        noBlocked: "No Blocked Users",
        noBlockedDesc: "There are currently no blocked users in the system.",
        unblock: "Unblock",
        deletePermanently: "Delete permanently",
        close: "Close",
        confirmDeleteTitle: "Delete User",
        confirmDeleteDesc: "Are you sure you want to delete this user? This action cannot be undone.",
        cancel: "Cancel",
        delete: "Delete",
      },
    },
    blogs: {
      title: "Blogs Management",
      searchPlaceholder: "Search blogs by title or author...",
      createBlog: "Create Blog",
      imageTitle: "Image / Title",
      author: "Author",
      category: "Category",
      date: "Date",
      actions: {
        viewBlog: "View Blog",
        deleteBlog: "Delete Blog",
      },
      viewBlog: "View Blog",
      deleteBlog: "Delete Blog",
      noBlogsFound: "No blog posts found.",
      createBlogTitle: "Create New Blog Post",
      blogTitleLabel: "Blog Title",
      blogTitlePlaceholder: "e.g. Modern Home Renovation Trends 2026",
      authorLabel: "Author Name",
      authorPlaceholder: "e.g. Sarah Jenkins",
      categoryLabel: "Category",
      contentLabel: "Article Content (HTML / Text)",
      contentPlaceholder: "Write the full blog post content here...",
      blogDetailsTitle: "Blog Details Preview",
      deleteBlogTitle: "Delete Blog Post",
      deleteBlogConfirm: "Are you sure you want to delete this blog post? This action cannot be undone.",
      deleteConfirm: "Are you sure you want to delete this blog post? This action cannot be undone.",
      by: "By",
      showing: "Showing",
      to: "to",
      of: "of",
      blogsCount: "blogs",
      tableHeaders: {
        no: "No",
        title: "Title",
        author: "Author",
        category: "Category",
        createdDate: "Created Date",
        action: "Action",
      },
      createModal: {
        title: "Create New Blog Post",
        blogTitle: "Blog Title",
        blogTitlePlaceholder: "e.g. Modern Home Renovation Trends 2026",
        author: "Author Name",
        authorPlaceholder: "e.g. Sarah Jenkins",
        category: "Category",
        categoryPlaceholder: "Select or enter category",
        content: "Article Content",
        cancel: "Cancel",
        submit: "Publish Post",
        errors: {
          titleRequired: "Blog title is required",
          authorRequired: "Author name is required",
          categoryRequired: "Category is required",
          contentRequired: "Blog content is required",
        },
      },
    },
    category: {
      title: "Categories Management",
      searchPlaceholder: "Search categories...",
      addCategory: "Add Category",
      categoryName: "Category Name",
      subcategories: "Subcategories",
      createdDate: "Created Date",
      actions: {
        editCategory: "Edit Category",
        deleteCategory: "Delete Category",
      },
      editCategory: "Edit Category",
      deleteCategory: "Delete Category",
      noCategoriesFound: "No categories found.",
      createCategoryTitle: "Create Category",
      editCategoryTitle: "Edit Category",
      deleteCategoryTitle: "Delete Category",
      deleteCategoryConfirm: "Are you sure you want to delete this category? This action cannot be undone.",
      categoryNameLabel: "Category Name",
      categoryNamePlaceholder: "e.g. Sanitär & Heizungstechnik",
      subcategoriesLabel: "Subcategories (comma separated)",
      subcategoriesPlaceholder: "Rohrreinigung, Armaturen, Notdienst",
      createModal: {
        title: "Create Category",
        categoryName: "Category Name",
        categoryNamePlaceholder: "Enter category name",
        subCategories: "Subcategories",
        subCategoryPlaceholder: "Subcategory name",
        addSubCategory: "Add Subcategory",
        cancel: "Cancel",
        submit: "Create",
        errors: {
          nameRequired: "Category name is required",
        },
      },
      editModal: {
        title: "Edit Category",
        categoryName: "Category Name",
        categoryNamePlaceholder: "Enter category name",
        subCategories: "Subcategories",
        subCategoryPlaceholder: "Subcategory name",
        addSubCategory: "Add Subcategory",
        cancel: "Cancel",
        save: "Save Changes",
        errors: {
          nameRequired: "Category name is required",
        },
      },
      deleteModal: {
        title: "Delete Category",
        desc: "Are you sure you want to delete {name}? This action cannot be undone.",
        cancel: "Cancel",
        delete: "Delete",
      },
      tableHeaders: {
        no: "No",
        category: "Category",
        categoryName: "Category Name",
        subcategories: "Subcategories",
        subCategories: "Subcategories",
        createdDate: "Created Date",
        actions: "Actions",
        action: "Action",
      },
      more: "more",
      showing: "Showing",
      to: "to",
      of: "of",
      categoriesCount: "categories",
    },
    chats: {
      title: "Support & User Messages",
      searchPlaceholder: "Search conversations...",
      typeMessage: "Type your message...",
      send: "Send",
      noConversationSelected: "No conversation selected",
      selectToChat: "Select a user from the sidebar to inspect conversation transcripts.",
      selectToStart: "Select a user from the sidebar to inspect conversation transcripts.",
      you: "You (Admin)",
      unknown: "Unknown User",
    },
    earnings: {
      title: "Earnings & Revenue",
      subtitle: "Track platform revenue and transaction history",
      averageTransaction: "Average Transaction",
      avgTransaction: "Average Transaction",
      currentMonthRevenue: "Current Month Revenue",
      totalRevenue: "Total Revenue",
      recentTransactions: "Recent Transactions",
      transactionId: "Transaction ID",
      date: "Date",
      description: "Description",
      type: "Type",
      amount: "Amount",
      status: "Status",
      filterYear: "Year Filter",
      yearLabel: "Year",
      transactionsCount: "transactions",
      saleType: "Sale",
      serviceType: "Service",
      recurringType: "Recurring",
      refundType: "Refund",
    },
    notifications: {
      title: "Notifications",
      markAllRead: "Mark all read",
      readAll: "Read all",
      noNotifications: "No notifications yet.",
      viewAll: "View all notifications",
      mark: "Mark",
      allNotifications: "All notifications",
    },
    profile: {
      title: "Admin Profile",
      subtitle: "Update your personal details and administrator credentials.",
      profileDetails: "Profile Details",
      fullName: "Full Name",
      fullNamePlaceholder: "Enter your full name",
      emailAddress: "Email Address",
      emailPlaceholder: "Enter your email",
      phoneNumber: "Phone Number",
      phonePlaceholder: "Enter your phone number",
      changeAvatarText: "Click the camera icon to upload a new profile image",
      saveChanges: "Save Changes",
      nameRequired: "Name is required",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email address format",
      phoneRequired: "Phone number is required",
      updateSuccess: "Profile updated successfully!",
    },
    reports: {
      title: "User Reports & Issues",
      loading: "Loading reports...",
      user: "User",
      consultant: "Service / Provider",
      reason: "Reason / Incident",
      date: "Date",
      status: {
        pending: "Pending",
        reviewed: "Reviewed",
        resolved: "Resolved",
      },
      actions: {
        markReviewed: "Mark Reviewed",
        resolve: "Resolve",
      },
      tableHeaders: {
        user: "User",
        consultant: "Service / Provider",
        reason: "Reason / Incident",
        date: "Date",
        status: "Status",
        actions: "Actions",
      },
      markReviewed: "Mark Reviewed",
      resolve: "Resolve",
      noReportsFound: "No reports found matching your criteria.",
      loadingReports: "Loading reports...",
      pendingStatus: "Pending",
      reviewedStatus: "Reviewed",
      resolvedStatus: "Resolved",
    },
    subscription: {
      title: "Subscription Plans",
      manageSubscriptions: "Manage Subscription",
      managePlans: "Manage Plans",
      month: "month",
      year: "year",
      bestValue: "Best Value",
      saveAmount: "Save CHF 58.00",
      subscribedUsers: "Subscribed Users",
      userName: "User Name",
      email: "Email",
      startDate: "Start Date",
      nextBilling: "Next Billing",
      active: "Active",
      cancelled: "Cancelled",
      usersText: "users",
      monthlyPlanTitle: "Premium Monthly",
      yearlyPlanTitle: "Premium Yearly",
      perMonth: "per month",
      perYear: "per year",
      features: "Features Included",
      subscribersList: "Current Subscriber List",
      user: "User",
      plan: "Plan",
      amount: "Amount",
      billingCycle: "Billing Cycle",
      status: "Status",
      renewalDate: "Renewal Date",
      modalTitle: "Manage Subscription Plans",
      planNameLabel: "Plan Name",
      priceLabel: "Price (CHF)",
      billingCycleLabel: "Billing Cycle",
      featuresLabel: "Features",
      addFeature: "Add",
    },
    customers: {
      title: "Customer Management",
      subtitle: "Manage registered customers, booking history, and account standing.",
      searchPlaceholder: "Search customers by name, email, phone or city...",
      allTab: "All Customers",
      activeTab: "Active",
      blockedTab: "Blocked",
      totalBookings: "Bookings",
      totalSpent: "Total Spent",
      viewProfile: "View Profile",
      blockCustomer: "Block Customer",
      unblockCustomer: "Unblock Customer",
      createBooking: "Create Booking",
      name: "Customer Name",
      email: "Email Address",
      phone: "Phone",
      joined: "Joined Date",
      noCustomersFound: "No customers found matching your criteria.",
      customerDetailsTitle: "Customer Profile & Activity",
      customerProfile: "Customer Profile",
      bookingHistory: "Booking History",
      newBookingTitle: "Create Booking for Customer",
      serviceName: "Service",
      provider: "Assigned Provider",
      date: "Booking Date",
      time: "Scheduled Time",
      amount: "Total Amount (CHF)",
    },
    providers: {
      title: "Provider Management",
      subtitle: "Oversee companies, individual specialists, ratings, and active service offerings.",
      searchPlaceholder: "Search provider, company, specialty, email...",
      allTab: "All Providers",
      companyTab: "Company",
      personalTab: "Personal",
      services: "Services",
      rating: "Rating",
      verified: "Verified",
      unverified: "Unverified",
      addService: "Add Service",
      viewDetails: "View Details",
      businessName: "Provider / Business Name",
      contactPerson: "Contact Person",
      category: "Category",
      noProvidersFound: "No providers found matching your criteria.",
      providerDetailsTitle: "Provider Details & Services",
      servicesOffered: "Services Offered",
      hourlyRate: "Hourly Rate",
      duration: "Duration",
      newServiceTitle: "Add New Service for Provider",
      newServiceDesc: "Directly add a new certified service to this provider's catalog.",
      serviceTitleLabel: "Service Title",
      categoryLabel: "Category",
      priceLabel: "Price (CHF/hr)",
      durationLabel: "Estimated Duration",
      descriptionLabel: "Description",
      imageUrlLabel: "Image URL",
    },
    bookings: {
      title: "Booking & Orders Management",
      subtitle: "Monitor, update, and manage all customer appointments across the platform.",
      searchPlaceholder: "Search by Booking ID, customer, provider, or service...",
      allTab: "All Bookings",
      pendingTab: "Pending",
      confirmedTab: "Confirmed",
      completedTab: "Completed",
      cancelledTab: "Cancelled",
      customer: "Customer",
      provider: "Provider",
      service: "Service",
      date: "Date",
      time: "Time",
      amount: "Amount",
      status: "Status",
      changeStatus: "Change Status",
      viewDetails: "View Details",
      noBookingsFound: "No bookings found matching selected filter.",
      bookingDetailsTitle: "Booking & Order Details",
      address: "Service Address",
      notes: "Customer Notes & Instructions",
      updateStatusSuccess: "Booking status updated successfully.",
    },
    products: {
      title: "Product & Service Moderation",
      subtitle: "Inspect seller uploaded listings, AI photo quality scores, and maintain compliance standards.",
      inspectorLive: "AI Inspector Live",
      totalListings: "Total Listings",
      approvedLive: "Approved & Live",
      underReviewFlagged: "Under Review / Flagged",
      completedSold: "Completed Sold",
      allTab: "All",
      liveTab: "Live",
      underReviewTab: "Under Review",
      soldTab: "Sold",
      searchPlaceholder: "Search product, seller...",
      productImage: "Product & Image",
      category: "Category",
      seller: "Seller",
      priceFloor: "Price / Floor",
      aiPhotoScore: "AI Photo Score",
      status: "Status",
      actions: "Actions",
      inspectDetails: "Inspect Details",
      approveListing: "Approve Listing",
      flagListing: "Flag Listing",
      deleteListing: "Delete Listing",
      noListingsFound: "No products found matching filters.",
      detailsModalTitle: "Product Inspection & Compliance Details",
      aiInspectionDetails: "AI Vision & Photo Quality Inspection",
      detectedType: "Detected Type",
      detectedColor: "Detected Color",
      lightingStatus: "Lighting Status",
      angleAdvice: "Angle & Quality Advice",
      rulesAndTerms: "ChatGPT Price Rules & Floor Margin",
      floorPrice: "Floor Price (Secret Limit)",
      shippingTerms: "Shipping Terms",
      returnPolicy: "Return Policy",
      customFaq: "Product Specifications & Notes",
    },
    chatgptOversight: {
      title: "Offers & Marketplace Moderation",
      subtitle: "Review customer price offers, enforce platform discount guardrails, and manage fraud protection rules.",
      sentryLive: "Escrow Protection Live",
      totalNegotiations: "Total Offers Processed",
      sessions: "Sessions",
      dealsAccepted: "Offers Accepted",
      rate: "Rate",
      offersDeclined: "Offers Declined",
      belowFloor: "Below Floor",
      platformDiscountCap: "Platform Discount Cap",
      protected: "Protected",
      rulesTitle: "Platform-Wide Offer Rules & Escrow Guardrails",
      rulesSubtitle: "These policies apply globally across all buyer and seller transactions.",
      rulesSaved: "Rules Saved Successfully!",
      maxDiscountLabel: "Max Platform Discount (%)",
      maxDiscountHint: "System will never accept automatic offers beyond this discount percentage.",
      forbiddenKeywordsLabel: "Fraud Blacklist Phrases",
      forbiddenKeywordsHint: "Blocks circumvention & off-platform escrow evasion.",
      aiStatusLabel: "Buyer Offers Status",
      aiActiveGlobally: "Direct Offers Active Globally",
      aiPaused: "Temporarily Paused",
      saveRules: "Save Global Rules",
      logsTitle: "Customer Offer & Negotiation Logs",
      logsSubtitle: "Full audit trail of customer price offers and counter-offers.",
      allFilter: "All",
      acceptedFilter: "Accepted",
      rejectedFilter: "Declined",
      searchLogs: "Search logs...",
      productCol: "Product",
      buyerSellerCol: "Buyer & Seller",
      offerFinalCol: "Offer / Final Price",
      statusCol: "Status",
      timestampCol: "Timestamp",
      rationaleCol: "AI Rationale Transcript",
      sellerPrefix: "Seller",
      dealPrefix: "Deal",
      noDeal: "No Deal",
    },
    platformCustomization: {
      title: "Platform Customization & Content CMS",
      subtitle: "Customize branding, UI theme colors, AI recognition categories, and bilingual legal policies.",
      savedSuccess: "Changes Saved Successfully!",
      identityTitle: "Platform Identity & Branding",
      platformTitleLabel: "Platform Title / Name",
      accentColorLabel: "Primary Accent Theme Color",
      logoLabel: "Platform Logo",
      defaultLogoActive: "Default Logo Active",
      logoOptimized: "High-res SVG / PNG transparent",
      aiCategoriesTitle: "AI Category & Tag Recognition Settings",
      aiCategoriesSubtitle: "Configure target taxonomy that the AI Photo Inspector assigns to vendor uploads.",
      aiCategoriesLabel: "Comma-separated AI Categories",
      legalPoliciesTitle: "Bilingual Platform Policies & FAQ",
      escrowTermsLabel: "Escrow & Quality Guarantee Terms",
      aiFaqLabel: "Global AI Sales Assistant Knowledge Prompt",
      saveChanges: "Save Platform Settings",
    },
    auth: {
      welcomeBack: "Welcome Back",
      signInPrompt: "Please sign in to continue to your dashboard",
      emailAddress: "Email Address",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      signIn: "Sign In",
      emailRequired: "Email is required",
      validEmailRequired: "Please enter a valid email",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      forgotPasswordTitle: "Forgot Password",
      forgotPasswordSubtitle: "Enter your email address and we'll send you an OTP to reset your password.",
      sendResetLink: "Send OTP Code",
      backToSignIn: "Back to Sign In",
      verifyOtpTitle: "Verify OTP Code",
      verifyOtpSubtitle: "Enter the 6-digit verification code sent to your email.",
      verifyOtpButton: "Verify Code",
      resendOtp: "Resend OTP",
      resetPasswordTitle: "Reset Password",
      resetPasswordSubtitle: "Create a new strong password for your administrator account.",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      updatePasswordButton: "Update Password",
    },
    settings: {
      title: "Platform Settings",
      subtitle: "Configure admin credentials, system preferences, and language.",
      changePassword: "Change Password",
      privacyPolicy: "Privacy Policy",
      termsConditions: "Terms & Conditions",
      aboutUs: "About Us",
      languagePreference: "Language Preference",
      languageDesc: "Select your preferred language for the Admin Dashboard.",
    },
  },
  DE: {
    common: {
      save: "Änderungen speichern",
      cancel: "Abbrechen",
      delete: "Löschen",
      edit: "Bearbeiten",
      search: "Suchen...",
      filter: "Filtern",
      all: "Alle",
      status: "Status",
      actions: "Aktionen",
      viewDetails: "Details anzeigen",
      close: "Schließen",
      back: "Zurück",
      loading: "Wird geladen...",
      success: "Erfolg",
      error: "Fehler",
      confirm: "Bestätigen",
      active: "Aktiv",
      inactive: "Inaktiv",
      pending: "Ausstehend",
      confirmed: "Bestätigt",
      completed: "Abgeschlossen",
      cancelled: "Storniert",
      blocked: "Gesperrt",
      unblock: "Entsperren",
      block: "Sperren",
      showing: "Zeige",
      to: "bis",
      of: "von",
      results: "Ergebnissen",
      previous: "Zurück",
      next: "Weiter",
      noDataFound: "Keine Datensätze gefunden.",
      yes: "Ja",
      no: "Nein",
    },
    nav: {
      dashboard: "Übersicht",
      customers: "Kunden",
      providers: "Dienstleister",
      bookings: "Buchungen",
      users: "Benutzer",
      admins: "Administratoren",
      earnings: "Einnahmen",
      subscription: "Abonnements",
      reports: "Berichte",
      products: "Produkte & Moderation",
      categories: "Kategorien",
      chatgptOversight: "Angebote & Moderation",
      identityVerification: "Ausweisprüfung",
      platformCustomization: "Anpassung & Regeln",
      settings: "Einstellungen",
      logout: "Abmelden",
      logoutConfirmTitle: "Abmeldung bestätigen",
      logoutConfirmDesc: "Sind Sie sicher, dass Sie sich vom Admin-Dashboard abmelden möchten?",
    },
    header: {
      welcome: "Willkommen",
      haveANiceDay: "Einen schönen Tag noch!",
      notifications: "Benachrichtigungen",
      profile: "Admin-Profil",
      language: "Sprache",
      english: "Englisch (EN)",
      german: "Deutsch (DE)",
    },
    dashboard: {
      totalRevenue: "Gesamteinnahmen",
      totalUsers: "Benutzer gesamt",
      totalBookings: "Buchungen gesamt",
      activeProviders: "Aktive Dienstleister",
      overviewTitle: "Plattform-Übersicht",
      overviewSubtitle: "Echtzeit-Metriken und Plattform-Aktivitäten",
      recentUsers: "Neueste Benutzer",
      userRatio: "Benutzerverhältnis & Demografie",
      quickStats: "Schnellstatistiken",
      marketplaceGrossVolume: "Marktplatz-Volumen",
      activeBuyersSellers: "Käufer & Verkäufer",
      inspectedAiListings: "Geprüfte KI-Produkte",
      aiNegotiations: "KI-Verhandlungen",
      operationsTitle: "Betrieb & Auftragsabwicklung",
      operationsSubtitle: "Live-Überwachung von Kundenanfragen, Dienstleister-Zuweisungen und Treuhand-Auszahlungen.",
      manageBookings: "Buchungen verwalten",
      viewProviders: "Verifizierte Dienstleister",
      financialReports: "Finanzberichte",
    },
    recentUsers: {
      title: "Neueste Benutzer",
      sId: "S.ID",
      fullName: "Vollständiger Name",
      email: "E-Mail",
      phoneNo: "Telefonnummer",
      userType: "Benutzertyp",
      joinedDate: "Beigetreten am",
      action: "Aktion",
      blockUser: "Benutzer sperren",
      viewDetails: "Details anzeigen",
      noUsersFound: "Keine neuen Benutzer gefunden.",
    },
    charts: {
      userRatioTitle: "Benutzerverhältnis",
      userRatioDescription: "Januar - Dezember",
      userRatio: "Benutzerverhältnis",
      selectYear: "Jahr wählen",
      usersLabel: "Benutzer",
      users: "Benutzer",
      monthlyRevenue: "Monatliche Einnahmen",
      revenueVsTarget: "Einnahmen vs. Ziel",
      productCategories: "Produktkategorien",
      products: "Produkte",
      productsPerCategory: "Produkte nach Kategorie",
      distributionProducts: "Verteilung der Produkte auf Kategorien",
      earnings: "Einnahmen",
      earningsOverview: "Einnahmen-Übersicht",
      earningsDesc: "Monatliche Umsatzentwicklung",
      trendingUp: "Trend steigend in diesem Monat",
      jan: "Jan",
      feb: "Feb",
      mar: "Mär",
      apr: "Apr",
      may: "Mai",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Okt",
      nov: "Nov",
      dec: "Dez",
      months: {
        january: "Januar",
        february: "Februar",
        march: "März",
        april: "April",
        may: "Mai",
        june: "Juni",
        july: "Juli",
        august: "August",
        september: "September",
        october: "Oktober",
        november: "November",
        december: "Dezember",
      },
    },
    admins: {
      title: "Administrator-Liste",
      searchPlaceholder: "Admin nach Name, E-Mail oder Rolle suchen...",
      createAdmin: "Admin erstellen",
      blockedAdmins: "Gesperrt",
      fullName: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phoneNo: "Telefonnummer",
      adminType: "Admin-Typ",
      joinedDate: "Beigetreten am",
      action: "Aktion",
      editAdmin: "Admin bearbeiten",
      blockAdmin: "Admin sperren",
      unblockAdmin: "Admin entsperren",
      deleteAdmin: "Admin löschen",
      viewDetails: "Details anzeigen",
      noAdminsFound: "Keine Administratoren gefunden.",
      createAdminTitle: "Neuen Administrator anlegen",
      editAdminTitle: "Administrator bearbeiten",
      blockAdminTitle: "Administrator sperren",
      blockAdminConfirm: "Sind Sie sicher, dass Sie diesen Administrator sperren möchten? Der Zugang zum Dashboard wird sofort entzogen.",
      nameLabel: "Vollständiger Name",
      namePlaceholder: "z.B. Alexander Weber",
      emailLabel: "E-Mail-Adresse",
      emailPlaceholder: "admin@odaboo.com",
      passwordLabel: "Passwort",
      passwordPlaceholder: "••••••••",
      roleLabel: "Administrator-Rolle",
      selectRole: "Rolle auswählen",
      saveAdmin: "Administrator speichern",
      editModal: {
        title: "Administrator bearbeiten",
        name: "Name",
        email: "E-Mail",
        role: "Rolle",
        selectRole: "Rolle auswählen",
        profileImage: "Profilbild",
        uploadImage: "Bild hochladen",
        cancel: "Abbrechen",
        save: "Änderungen speichern",
        errors: {
          nameRequired: "Name ist erforderlich",
          roleRequired: "Bitte wählen Sie eine Rolle aus",
        },
      },
      blockModal: {
        title: "Administrator sperren",
        desc: "Sind Sie sicher, dass Sie diesen Admin sperren möchten? Der Dashboard-Zugriff wird sofort entzogen.",
        cancel: "Abbrechen",
        confirm: "Admin sperren",
      },
      createModal: {
        title: "Neuen Administrator anlegen",
        name: "Name",
        namePlaceholder: "z.B. Max Mustermann",
        email: "E-Mail",
        emailPlaceholder: "admin@beispiel.de",
        newPassword: "Passwort",
        confirmPassword: "Passwort bestätigen",
        profileImage: "Profilbild",
        uploadImage: "Bild hochladen",
        submit: "Admin erstellen",
        errors: {
          nameRequired: "Name ist erforderlich",
          emailRequired: "E-Mail ist erforderlich",
          invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
          passwordRequired: "Passwort ist erforderlich",
          passwordMin: "Passwort muss mindestens 6 Zeichen lang sein",
          confirmRequired: "Bitte bestätigen Sie Ihr Passwort",
          passwordMismatch: "Passwörter stimmen nicht überein",
        },
      },
      tableHeaders: {
        no: "Nr.",
        adminName: "Admin-Name",
        role: "Rolle",
        phoneNumber: "Telefonnummer",
        joinedDate: "Beigetreten am",
        email: "E-Mail",
        action: "Aktion",
      },
      actions: {
        editAdmin: "Admin bearbeiten",
        blockAdmin: "Admin sperren",
        viewDetails: "Details anzeigen",
      },
      blocked: "Gesperrt",
      showing: "Zeige",
      to: "bis",
      of: "von",
      adminsCount: "Administratoren",
    },
    users: {
      title: "Benutzer-Liste",
      searchPlaceholder: "Benutzer nach Name, E-Mail oder Telefon suchen...",
      blockedUsers: "Gesperrt",
      fullName: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phoneNo: "Telefonnummer",
      joinedDate: "Beigetreten am",
      action: "Aktion",
      blockUser: "Benutzer sperren",
      viewDetails: "Details anzeigen",
      noUsersFound: "Keine Benutzer gefunden.",
      userDetailsTitle: "Benutzer-Profil & Details",
      blockedUsersTitle: "Liste gesperrter Benutzer",
      unblockUser: "Benutzer entsperren",
      blocked: "Gesperrt",
      clients: "Kunden",
      providers: "Dienstleister",
      showing: "Zeige",
      to: "bis",
      of: "von",
      usersCount: "Benutzer",
      tableHeaders: {
        no: "Nr.",
        userName: "Benutzername",
        phoneNumber: "Telefonnummer",
        joinedDate: "Beigetreten am",
        email: "E-Mail",
        action: "Aktion",
      },
      actions: {
        blockUser: "Benutzer sperren",
        viewDetails: "Details anzeigen",
      },
      detailsModal: {
        title: "Benutzerdetails",
        email: "E-Mail-Adresse",
        phone: "Telefonnummer",
        userType: "Benutzertyp",
        joinedDate: "Registrierungsdatum",
        close: "Schließen",
        blockUser: "Benutzer sperren",
      },
      blockedModal: {
        title: "Gesperrte Benutzer ({count})",
        noBlocked: "Keine gesperrten Benutzer",
        noBlockedDesc: "Derzeit befinden sich keine gesperrten Benutzer im System.",
        unblock: "Entsperren",
        deletePermanently: "Dauerhaft löschen",
        close: "Schließen",
        confirmDeleteTitle: "Benutzer löschen",
        confirmDeleteDesc: "Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Dies kann nicht rückgängig gemacht werden.",
        cancel: "Abbrechen",
        delete: "Löschen",
      },
    },
    blogs: {
      title: "Blog-Verwaltung",
      searchPlaceholder: "Blogs nach Titel oder Autor suchen...",
      createBlog: "Blog erstellen",
      imageTitle: "Bild / Titel",
      author: "Autor",
      category: "Kategorie",
      date: "Datum",
      actions: {
        viewBlog: "Blog ansehen",
        deleteBlog: "Blog löschen",
      },
      viewBlog: "Blog ansehen",
      deleteBlog: "Blog löschen",
      noBlogsFound: "Keine Blog-Beiträge gefunden.",
      createBlogTitle: "Neuen Blog-Beitrag erstellen",
      blogTitleLabel: "Blog-Titel",
      blogTitlePlaceholder: "z.B. Moderne Renovierungstrends 2026",
      authorLabel: "Name des Autors",
      authorPlaceholder: "z.B. Sarah Jenkins",
      categoryLabel: "Kategorie",
      contentLabel: "Artikelinhalt (HTML / Text)",
      contentPlaceholder: "Geben Sie hier den vollständigen Artikeltext ein...",
      blogDetailsTitle: "Blog-Vorschau",
      deleteBlogTitle: "Blog-Beitrag löschen",
      deleteBlogConfirm: "Sind Sie sicher, dass Sie diesen Blog-Beitrag löschen möchten? Dies kann nicht rückgängig gemacht werden.",
      deleteConfirm: "Sind Sie sicher, dass Sie diesen Blog-Beitrag löschen möchten? Dies kann nicht rückgängig gemacht werden.",
      by: "Von",
      showing: "Zeige",
      to: "bis",
      of: "von",
      blogsCount: "Beiträge",
      tableHeaders: {
        no: "Nr.",
        title: "Titel",
        author: "Autor",
        category: "Kategorie",
        createdDate: "Erstellungsdatum",
        action: "Aktion",
      },
      createModal: {
        title: "Neuen Blog-Beitrag erstellen",
        blogTitle: "Blog-Titel",
        blogTitlePlaceholder: "z.B. Moderne Renovierungstrends 2026",
        author: "Name des Autors",
        authorPlaceholder: "z.B. Sarah Jenkins",
        category: "Kategorie",
        categoryPlaceholder: "Kategorie auswählen oder eingeben",
        content: "Artikelinhalt",
        cancel: "Abbrechen",
        submit: "Beitrag veröffentlichen",
        errors: {
          titleRequired: "Blogtitel ist erforderlich",
          authorRequired: "Name des Autors ist erforderlich",
          categoryRequired: "Kategorie ist erforderlich",
          contentRequired: "Artikelinhalt ist erforderlich",
        },
      },
    },
    category: {
      title: "Kategorie-Verwaltung",
      searchPlaceholder: "Kategorien durchsuchen...",
      addCategory: "Kategorie hinzufügen",
      categoryName: "Kategoriename",
      subcategories: "Unterkategorien",
      createdDate: "Erstellungsdatum",
      actions: {
        editCategory: "Kategorie bearbeiten",
        deleteCategory: "Kategorie löschen",
      },
      editCategory: "Kategorie bearbeiten",
      deleteCategory: "Kategorie löschen",
      noCategoriesFound: "Keine Kategorien gefunden.",
      createCategoryTitle: "Kategorie erstellen",
      editCategoryTitle: "Kategorie bearbeiten",
      deleteCategoryTitle: "Kategorie löschen",
      deleteCategoryConfirm: "Sind Sie sicher, dass Sie diese Kategorie löschen möchten? Dies kann nicht rückgängig gemacht werden.",
      categoryNameLabel: "Kategoriename",
      categoryNamePlaceholder: "z.B. Elektrik & Smart Home",
      subcategoriesLabel: "Unterkategorien (kommagetrennt)",
      subcategoriesPlaceholder: "Verkabelung, Beleuchtung, Ladestation",
      createModal: {
        title: "Kategorie erstellen",
        categoryName: "Kategoriename",
        categoryNamePlaceholder: "Kategorienamen eingeben",
        subCategories: "Unterkategorien",
        subCategoryPlaceholder: "Name der Unterkategorie",
        addSubCategory: "Unterkategorie hinzufügen",
        cancel: "Abbrechen",
        submit: "Erstellen",
        errors: {
          nameRequired: "Kategoriename ist erforderlich",
        },
      },
      editModal: {
        title: "Kategorie bearbeiten",
        categoryName: "Kategoriename",
        categoryNamePlaceholder: "Kategorienamen eingeben",
        subCategories: "Unterkategorien",
        subCategoryPlaceholder: "Name der Unterkategorie",
        addSubCategory: "Unterkategorie hinzufügen",
        cancel: "Abbrechen",
        save: "Änderungen speichern",
        errors: {
          nameRequired: "Kategoriename ist erforderlich",
        },
      },
      deleteModal: {
        title: "Kategorie löschen",
        desc: "Sind Sie sicher, dass Sie {name} löschen möchten? Dies kann nicht rückgängig gemacht werden.",
        cancel: "Abbrechen",
        delete: "Löschen",
      },
      tableHeaders: {
        no: "Nr.",
        category: "Kategorie",
        categoryName: "Kategoriename",
        subcategories: "Unterkategorien",
        subCategories: "Unterkategorien",
        createdDate: "Erstellungsdatum",
        actions: "Aktionen",
        action: "Aktion",
      },
      more: "weitere",
      showing: "Zeige",
      to: "bis",
      of: "von",
      categoriesCount: "Kategorien",
    },
    chats: {
      title: "Support & Benutzer-Chats",
      searchPlaceholder: "Konversationen durchsuchen...",
      typeMessage: "Nachricht eingeben...",
      send: "Senden",
      noConversationSelected: "Keine Konversation ausgewählt",
      selectToChat: "Wählen Sie einen Benutzer aus der Seitenleiste aus, um den Chatverlauf einzusehen.",
      selectToStart: "Wählen Sie einen Benutzer aus der Seitenleiste aus, um den Chatverlauf einzusehen.",
      you: "Sie (Admin)",
      unknown: "Unbekannter Benutzer",
    },
    earnings: {
      title: "Einnahmen & Finanzübersicht",
      subtitle: "Plattformeinnahmen und Transaktionshistorie verfolgen",
      averageTransaction: "Durchschnittliche Transaktion",
      avgTransaction: "Durchschnittliche Transaktion",
      currentMonthRevenue: "Einnahmen laufender Monat",
      totalRevenue: "Gesamteinnahmen",
      recentTransactions: "Neueste Transaktionen",
      transactionId: "Transaktions-ID",
      date: "Datum",
      description: "Beschreibung",
      type: "Typ",
      amount: "Betrag",
      status: "Status",
      filterYear: "Jahresfilter",
      yearLabel: "Jahr",
      transactionsCount: "Transaktionen",
      saleType: "Verkauf",
      serviceType: "Dienstleistung",
      recurringType: "Abonnement",
      refundType: "Rückerstattung",
    },
    notifications: {
      title: "Benachrichtigungen",
      markAllRead: "Alle als gelesen markieren",
      readAll: "Alle lesen",
      noNotifications: "Keine neuen Benachrichtigungen.",
      viewAll: "Alle Benachrichtigungen anzeigen",
      mark: "Markieren",
      allNotifications: "Alle Benachrichtigungen",
    },
    profile: {
      title: "Admin-Profil",
      subtitle: "Verwalten Sie Ihre persönlichen Kontaktdaten und Administratorrechte.",
      profileDetails: "Profildetails",
      fullName: "Vollständiger Name",
      fullNamePlaceholder: "Geben Sie Ihren vollständigen Namen ein",
      emailAddress: "E-Mail-Adresse",
      emailPlaceholder: "Geben Sie Ihre E-Mail ein",
      phoneNumber: "Telefonnummer",
      phonePlaceholder: "Geben Sie Ihre Telefonnummer ein",
      changeAvatarText: "Klicken Sie auf das Kamera-Symbol, um das Profilbild zu ändern",
      saveChanges: "Änderungen speichern",
      nameRequired: "Name ist erforderlich",
      emailRequired: "E-Mail ist erforderlich",
      emailInvalid: "Ungültiges E-Mail-Format",
      phoneRequired: "Telefonnummer ist erforderlich",
      updateSuccess: "Profil erfolgreich aktualisiert!",
    },
    reports: {
      title: "Meldungen & Problemfälle",
      loading: "Meldungen werden geladen...",
      user: "Benutzer",
      consultant: "Dienst / Dienstleister",
      reason: "Grund / Vorfall",
      date: "Datum",
      status: {
        pending: "Ausstehend",
        reviewed: "Geprüft",
        resolved: "Gelöst",
      },
      actions: {
        markReviewed: "Als geprüft markieren",
        resolve: "Lösen",
      },
      tableHeaders: {
        user: "Benutzer",
        consultant: "Dienst / Dienstleister",
        reason: "Grund / Vorfall",
        date: "Datum",
        status: "Status",
        actions: "Aktionen",
      },
      markReviewed: "Als geprüft markieren",
      resolve: "Lösen",
      noReportsFound: "Keine Meldungen gefunden.",
      loadingReports: "Meldungen werden geladen...",
      pendingStatus: "Ausstehend",
      reviewedStatus: "Geprüft",
      resolvedStatus: "Gelöst",
    },
    subscription: {
      title: "Abonnement-Tarife",
      manageSubscriptions: "Abonnements verwalten",
      managePlans: "Pläne verwalten",
      month: "Monat",
      year: "Jahr",
      bestValue: "Bester Wert",
      saveAmount: "Sparen Sie 58.00 CHF",
      subscribedUsers: "Abonnierte Benutzer",
      userName: "Benutzername",
      email: "E-Mail",
      startDate: "Startdatum",
      nextBilling: "Nächste Abrechnung",
      active: "Aktiv",
      cancelled: "Gekündigt",
      usersText: "Benutzer",
      monthlyPlanTitle: "Premium Monatlich",
      yearlyPlanTitle: "Premium Jährlich",
      perMonth: "pro Monat",
      perYear: "pro Jahr",
      features: "Enthaltene Funktionen",
      subscribersList: "Aktuelle Abonnentenliste",
      user: "Benutzer",
      plan: "Tarif",
      amount: "Betrag",
      billingCycle: "Abrechnungszyklus",
      status: "Status",
      renewalDate: "Verlängerungsdatum",
      modalTitle: "Abonnement-Pläne verwalten",
      planNameLabel: "Tarifname",
      priceLabel: "Preis (CHF)",
      billingCycleLabel: "Abrechnungszyklus",
      featuresLabel: "Funktionen",
      addFeature: "Hinzufügen",
    },
    customers: {
      title: "Kundenverwaltung",
      subtitle: "Verwalten Sie registrierte Kunden, Buchungsverläufe und Kontostatus.",
      searchPlaceholder: "Kunden nach Name, E-Mail oder Stadt suchen...",
      allTab: "Alle Kunden",
      activeTab: "Aktiv",
      blockedTab: "Gesperrt",
      totalBookings: "Buchungen",
      totalSpent: "Gesamtausgaben",
      viewProfile: "Profil anzeigen",
      blockCustomer: "Kunde sperren",
      unblockCustomer: "Kunde entsperren",
      createBooking: "Buchung erstellen",
      name: "Kundenname",
      email: "E-Mail-Adresse",
      phone: "Telefon",
      joined: "Beigetreten am",
      noCustomersFound: "Keine passenden Kunden gefunden.",
      customerDetailsTitle: "Kundenprofil & Verlauf",
      customerProfile: "Kundenprofil",
      bookingHistory: "Buchungsverlauf",
      newBookingTitle: "Buchung für Kunden anlegen",
      serviceName: "Dienstleistung",
      provider: "Zugewiesener Dienstleister",
      date: "Buchungsdatum",
      time: "Geplante Uhrzeit",
      amount: "Gesamtbetrag (CHF)",
    },
    providers: {
      title: "Dienstleister-Verwaltung",
      subtitle: "Überwachen Sie Unternehmen und Einzelanbieter, Bewertungen und Dienstleistungen.",
      searchPlaceholder: "Dienstleister nach Name, Kategorie oder Stadt suchen...",
      allTab: "Alle Dienstleister",
      companyTab: "Unternehmen",
      personalTab: "Einzelperson",
      services: "Dienste",
      rating: "Bewertung",
      verified: "Verifiziert",
      unverified: "Nicht verifiziert",
      addService: "Dienst hinzufügen",
      viewDetails: "Details anzeigen",
      businessName: "Dienstleister- / Firmenname",
      contactPerson: "Kontaktperson",
      category: "Hauptkategorie",
      noProvidersFound: "Keine Dienstleister gefunden.",
      providerDetailsTitle: "Dienstleisterdetails & Dienste",
      servicesOffered: "Angebotene Dienste",
      hourlyRate: "Stundensatz",
      duration: "Dauer",
      newServiceTitle: "Neuen Dienst für Dienstleister anlegen",
      newServiceDesc: "Fügen Sie direkt einen neuen Dienst zum Dienstleister-Katalog hinzu.",
      serviceTitleLabel: "Titel des Dienstes",
      categoryLabel: "Kategorie",
      priceLabel: "Preis (CHF/Std.)",
      durationLabel: "Geschätzte Dauer",
      descriptionLabel: "Beschreibung",
      imageUrlLabel: "Bild-URL",
    },
    bookings: {
      title: "Buchungs- & Auftragsverwaltung",
      subtitle: "Überwachen und verwalten Sie alle Kundenreservierungen auf der Plattform.",
      searchPlaceholder: "Nach Buchungs-ID, Kunde, Dienstleister oder Dienst suchen...",
      allTab: "Alle Buchungen",
      pendingTab: "Ausstehend",
      confirmedTab: "Bestätigt",
      completedTab: "Abgeschlossen",
      cancelledTab: "Storniert",
      customer: "Kunde",
      provider: "Dienstleister",
      service: "Dienst",
      date: "Datum",
      time: "Uhrzeit",
      amount: "Betrag",
      status: "Status",
      changeStatus: "Status aktualisieren",
      viewDetails: "Details anzeigen",
      noBookingsFound: "Keine Buchungen für den ausgewählten Filter gefunden.",
      bookingDetailsTitle: "Buchungs- & Auftragsdetails",
      address: "Einsatzort / Adresse",
      notes: "Kundenhinweise & Anweisungen",
      updateStatusSuccess: "Buchungsstatus erfolgreich aktualisiert.",
    },
    products: {
      title: "Produkt- & Service-Moderation",
      subtitle: "Prüfen Sie von Verkäufern eingestellte Produkte, KI-Qualitätsbewertungen und Verkaufsstatus.",
      inspectorLive: "KI-Inspektor Aktiv",
      totalListings: "Gesamtangebote",
      approvedLive: "Freigegeben & Live",
      underReviewFlagged: "In Prüfung / Gemeldet",
      completedSold: "Erfolgreich Verkauft",
      allTab: "Alle",
      liveTab: "Freigegeben",
      underReviewTab: "In Prüfung",
      soldTab: "Verkauft",
      searchPlaceholder: "Suchen nach Produkt, Verkäufer...",
      productImage: "Produkt & Foto",
      category: "Kategorie",
      seller: "Verkäufer",
      priceFloor: "Preise (Listen / Floor)",
      aiPhotoScore: "KI-Foto Score",
      status: "Status",
      actions: "Aktionen",
      inspectDetails: "Details ansehen",
      approveListing: "Angebot freigeben",
      flagListing: "Angebot markieren",
      deleteListing: "Angebot löschen",
      noListingsFound: "Keine Produkte für diesen Filter gefunden.",
      detailsModalTitle: "Produkt-Inspektion & Compliance-Details",
      aiInspectionDetails: "KI-Bildanalyse & Fotoqualität",
      detectedType: "Erkannter Typ",
      detectedColor: "Erkannte Farbe",
      lightingStatus: "Beleuchtungsstatus",
      angleAdvice: "Winkel & Qualitäts-Empfehlung",
      rulesAndTerms: "ChatGPT-Preisregeln & Mindestmarge",
      floorPrice: "Mindestpreis (Geheimes Limit)",
      shippingTerms: "Versandbedingungen",
      returnPolicy: "Rückgaberichtlinie",
      customFaq: "Produktspezifikationen & Hinweise",
    },
    chatgptOversight: {
      title: "Angebote & Marktplatz-Moderation",
      subtitle: "Überwachen Sie Preisangebote, setzen Sie globale Rabattgrenzen und blockieren Sie Umgehungsversuche.",
      sentryLive: "Treuhand-Schutz Aktiv",
      totalNegotiations: "Gesamte Angebote",
      sessions: "Sitzungen",
      dealsAccepted: "Angenommene Angebote",
      rate: "Quote",
      offersDeclined: "Abgelehnte Angebote",
      belowFloor: "Unter Limit",
      platformDiscountCap: "Maximaler Rabattdeckel",
      protected: "Geschützt",
      rulesTitle: "Plattformweite Angebotsregeln & Treuhandgrenzen",
      rulesSubtitle: "Diese Einstellungen gelten für alle Käufer- und Verkäufertransaktionen.",
      rulesSaved: "Regeln erfolgreich gespeichert!",
      maxDiscountLabel: "Maximaler Plattform-Rabatt (%)",
      maxDiscountHint: "Das System erlaubt keine automatischen Angebote über diesem Wert.",
      forbiddenKeywordsLabel: "Verbotene Begriffe (Betrugsprävention)",
      forbiddenKeywordsHint: "Verhindert betrügerische Zahlungsaufforderungen und Plattformumgehung.",
      aiStatusLabel: "Käuferangebote Status",
      aiActiveGlobally: "Direktangebote Global Aktiv",
      aiPaused: "Global Pausiert",
      saveRules: "Regeln Speichern",
      logsTitle: "Kundenangebot- & Verhandlungsprotokolle",
      logsSubtitle: "Echtzeit-Aufzeichnungen von Preisangeboten und Gegenangeboten.",
      allFilter: "Alle",
      acceptedFilter: "Angenommen",
      rejectedFilter: "Abgelehnt",
      searchLogs: "Suche nach Produkt, Käufer...",
      productCol: "Produkt",
      buyerSellerCol: "Käufer & Verkäufer",
      offerFinalCol: "Angebot / Finaler Preis",
      statusCol: "Status",
      timestampCol: "Zeitstempel",
      rationaleCol: "KI-Begründung / Transkript",
      sellerPrefix: "Verkäufer",
      dealPrefix: "Deal",
      noDeal: "Kein Deal",
    },
    platformCustomization: {
      title: "Plattform-Anpassung & Content-Management",
      subtitle: "Passen Sie Logo, Theme-Akzentfarben, KI-Erkennungskategorien und rechtliche Richtlinien an.",
      savedSuccess: "Einstellungen erfolgreich gespeichert!",
      identityTitle: "Branding & Plattformname",
      platformTitleLabel: "Plattform-Titel",
      accentColorLabel: "Primäre Theme-Akzentfarbe",
      logoLabel: "Plattform Logo",
      defaultLogoActive: "Standard-Logo aktiv",
      logoOptimized: "Optimiert für helle und dunkle Themes",
      aiCategoriesTitle: "KI-Kategorien & Erkennungs-Tags",
      aiCategoriesSubtitle: "Definieren Sie Kategorien, die unsere Bild-KI automatisch zuweist.",
      aiCategoriesLabel: "Kommagetrennte KI-Kategorien",
      legalPoliciesTitle: "Rechtliche Richtlinien & KI-FAQ",
      escrowTermsLabel: "Treuhand- & Qualitätsgarantie-Bedingungen",
      aiFaqLabel: "Globales Wissens-Prompt für KI-Verkaufsassistent",
      saveChanges: "Einstellungen speichern",
    },
    auth: {
      welcomeBack: "Willkommen zurück",
      signInPrompt: "Bitte melden Sie sich an, um zum Dashboard fortzufahren",
      emailAddress: "E-Mail-Adresse",
      password: "Passwort",
      rememberMe: "Angemeldet bleiben",
      forgotPassword: "Passwort vergessen?",
      signIn: "Anmelden",
      emailRequired: "E-Mail ist erforderlich",
      validEmailRequired: "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      passwordRequired: "Passwort ist erforderlich",
      passwordMinLength: "Passwort muss mindestens 6 Zeichen lang sein",
      forgotPasswordTitle: "Passwort vergessen",
      forgotPasswordSubtitle: "Geben Sie Ihre E-Mail-Adresse ein, um einen OTP-Code zum Zurücksetzen zu erhalten.",
      sendResetLink: "OTP-Code senden",
      backToSignIn: "Zurück zur Anmeldung",
      verifyOtpTitle: "OTP-Code bestätigen",
      verifyOtpSubtitle: "Geben Sie den 6-stelligen Bestätigungscode ein, der an Ihre E-Mail gesendet wurde.",
      verifyOtpButton: "Code bestätigen",
      resendOtp: "Code erneut senden",
      resetPasswordTitle: "Neues Passwort festlegen",
      resetPasswordSubtitle: "Erstellen Sie ein neues, sicheres Passwort für Ihr Administratorkonto.",
      newPassword: "Neues Passwort",
      confirmPassword: "Passwort bestätigen",
      updatePasswordButton: "Passwort aktualisieren",
    },
    settings: {
      title: "Plattform-Einstellungen",
      subtitle: "Konfigurieren Sie Administrator-Zugangsdaten, Systemeinstellungen und Sprache.",
      changePassword: "Passwort ändern",
      privacyPolicy: "Datenschutzerklärung",
      termsConditions: "Allgemeine Geschäftsbedingungen",
      aboutUs: "Über uns",
      languagePreference: "Spracheinstellung",
      languageDesc: "Wählen Sie Ihre bevorzugte Sprache für das Admin-Dashboard.",
    },
  },
};
