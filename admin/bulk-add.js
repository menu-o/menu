import { adminUpsertItem } from '../assets/firebase.js';

async function bulkAddFood() {
  const token = localStorage.getItem('mu_admin_token');
  if (!token) {
    console.error('No token found. Please log in as admin first.');
    return;
  }

  const items = [
    // BREAKFAST
    { sectionId: 'breakfast', nameAr: 'بيض مخفوق', nameEn: 'Scrambled Eggs', price: 7000, descAr: 'بيض كريمي مخفوق بعناية يقدم مع الخبز المحمص', descEn: 'Creamy scrambled eggs served with toasted bread' },
    { sectionId: 'breakfast', nameAr: 'اومليت جولاي', nameEn: 'July Omelette', price: 8500, descAr: 'أومليت كلاسيكي محضر على طريقة جولاي الخاصة', descEn: 'Classic omelette prepared with July special recipe' },
    { sectionId: 'breakfast', nameAr: 'كرواسون اومليت', nameEn: 'Croissants Omelette', price: 9500, descAr: 'كرواسون فرنسي طازج محشو ببيض الأومليت اللذيذ', descEn: 'Fresh French croissant stuffed with delicious omelette' },
    { sectionId: 'breakfast', nameAr: 'بيض مقلي', nameEn: 'Sunny Side Eggs', price: 7000, descAr: 'بيض مقلي كلاسيكي مطهو بإتقان', descEn: 'Classic sunny side up eggs cooked to perfection' },
    { sectionId: 'breakfast', nameAr: 'اومليت جبن', nameEn: 'Cheesy Omelette', price: 8500, descAr: 'أومليت محشو بمزيج من الأجبان الغنية', descEn: 'Omelette stuffed with a rich blend of cheeses' },
    { sectionId: 'breakfast', nameAr: 'شيباتا اومليت', nameEn: 'Ciabatta Omelette', price: 9500, descAr: 'خبز الشيباتا الإيطالي مع الأومليت والأعشاب', descEn: 'Italian Ciabatta bread with omelette and herbs' },
    { sectionId: 'breakfast', nameAr: 'بيض شكشوكة', nameEn: 'Shakshuka Eggs', price: 9000, descAr: 'بيض مطهو مع صلصة الطماطم والفلفل والتوابل العربية', descEn: 'Eggs poached in a sauce of tomatoes, chili peppers, and Arabic spices' },

    // CROISSANTS
    { sectionId: 'croissants', nameAr: 'كرواسون سادة', nameEn: 'Plain Croissant', price: 5000, descAr: 'كرواسون فرنسي هش غني بالزبدة', descEn: 'Flaky French croissant rich in butter' },
    { sectionId: 'croissants', nameAr: 'كرواسون شوكولا', nameEn: 'Chocolate Croissant', price: 6000, descAr: 'كرواسون محشو بالشوكولاتة البلجيكية الفاخرة', descEn: 'Croissant stuffed with premium Belgian chocolate' },
    { sectionId: 'croissants', nameAr: 'كرواسون جبن', nameEn: 'Cheese Croissant', price: 6000, descAr: 'كرواسون محشو بمزيج من الأجبان المميزة', descEn: 'Croissant filled with a blend of special cheeses' },
    { sectionId: 'croissants', nameAr: 'كرواسون روست بيف', nameEn: 'Roast Beef Croissant', price: 9500, descAr: 'كرواسون محشو بشرائح الروست بيف والخضار', descEn: 'Croissant stuffed with roast beef slices and vegetables' },
    { sectionId: 'croissants', nameAr: 'كرواسون حبش', nameEn: 'Turkey Croissant', price: 9500, descAr: 'كرواسون محشو بشرائح الحبش المدخن والجبن', descEn: 'Croissant filled with smoked turkey slices and cheese' },
    { sectionId: 'croissants', nameAr: 'كرواسون تفاح كرمبل', nameEn: 'Apple Crumble Croissant', price: 9000, descAr: 'كرواسون مميز بحشوة التفاح والقرفة والقرمشة', descEn: 'Unique croissant with apple cinnamon filling and crumble' },

    // SANDWICHES
    { sectionId: 'sandwiches', nameAr: 'كلوب ساندويتش', nameEn: 'Club Sandwich', price: 7000, descAr: 'ساندويتش طبقات كلاسيكي مع الدجاج والبيض والخضار', descEn: 'Classic layered sandwich with chicken, egg, and vegetables' },
    { sectionId: 'sandwiches', nameAr: 'توست حبش', nameEn: 'Turkey Toast', price: 8500, descAr: 'توست محمص مع شرائح الحبش المدخن والجبن الذائب', descEn: 'Toasted bread with smoked turkey slices and melted cheese' },
    { sectionId: 'sandwiches', nameAr: 'روست بيف', nameEn: 'Roast Beef', price: 9000, descAr: 'ساندويتش شرائح لحم البقر المشوي مع صلصة خاصة', descEn: 'Roast beef slices sandwich with special sauce' },
    { sectionId: 'sandwiches', nameAr: 'دجاج الفريدو', nameEn: 'Chicken Alfredo', price: 8000, descAr: 'قطع الدجاج مع صلصة الفريدو الكريمية في خبز طازج', descEn: 'Chicken pieces with creamy Alfredo sauce in fresh bread' },
    { sectionId: 'sandwiches', nameAr: 'لحم ايطالي', nameEn: 'Italian Meat', price: 9000, descAr: 'لحم متبل على الطريقة الإيطالية مع الخضار', descEn: 'Italian styled seasoned meat with vegetables' },
    { sectionId: 'sandwiches', nameAr: 'توست زبدة الفول', nameEn: 'Peanut Butter Toast', price: 7000, descAr: 'توست مقرمش مع زبدة الفول السوداني الغنية', descEn: 'Crunchy toast with rich peanut butter' },

    // SALADS
    { sectionId: 'salads', nameAr: 'سلطة حلومي جولاي', nameEn: 'July Halloumi Salad', price: 7500, descAr: 'جبن حلوم مشوي مع خضار طازجة وصلصة مميزة', descEn: 'Grilled halloumi cheese with fresh vegetables and special dressing' },
    { sectionId: 'salads', nameAr: 'سلطة الكينوا', nameEn: 'Quinoa Salad', price: 7500, descAr: 'كينوا مغذية مع خضار موسمية وصلصة الليمون', descEn: 'Nutritious quinoa with seasonal vegetables and lemon dressing' },
    { sectionId: 'salads', nameAr: 'سلطة جبن الفيتا', nameEn: 'Feta Cheese Salad', price: 7500, descAr: 'سلطة يونانية كلاسيكية مع جبن الفيتا والزيتون', descEn: 'Classic Greek salad with feta cheese and olives' },
    { sectionId: 'salads', nameAr: 'سلطة جولاي سيزر', nameEn: 'July Cesar Salad', price: 7500, descAr: 'سلطة سيزر بلمسة جولاي الخاصة مع قطع الدجاج', descEn: 'Cesar salad with July special touch and chicken pieces' },

    // LUNCH & DINNER
    { sectionId: 'lunch_dinner', nameAr: 'دجاج بيكاتا', nameEn: 'Chicken Piccata', price: 14000, descAr: 'دجاج بصلصة الليمون والزبدة والكبر اللذيذة', descEn: 'Chicken in a delicious lemon, butter, and capers sauce' },
    { sectionId: 'lunch_dinner', nameAr: 'دجاج الكاري', nameEn: 'Chicken Curry', price: 14000, descAr: 'قطع الدجاج المطهوة بصلصة الكاري الغنية بالتوابل', descEn: 'Chicken pieces cooked in a rich spiced curry sauce' },
    { sectionId: 'lunch_dinner', nameAr: 'ستراغونوف الدجاج', nameEn: 'Chicken Stroganoff', price: 14000, descAr: 'دجاج مع الفطر في صلصة كريمية غنية', descEn: 'Chicken with mushrooms in a rich creamy sauce' },
    { sectionId: 'lunch_dinner', nameAr: 'ستراغونوف اللحم', nameEn: 'Beef Stroganoff', price: 16000, descAr: 'شرائح لحم البقر مع الفطر والصلصة الكريمية', descEn: 'Beef slices with mushrooms and creamy sauce' },
    { sectionId: 'lunch_dinner', nameAr: 'باربكيو لحم', nameEn: 'Meat Barbecue', price: 16000, descAr: 'لحم مشوي بصلصة الباربكيو المدخنة', descEn: 'Grilled meat with smoky barbecue sauce' },
    { sectionId: 'lunch_dinner', nameAr: 'طبق لحم جولاي', nameEn: 'July Meat Dish', price: 16000, descAr: 'طبق اللحم المميز بخلطة وتوابل جولاي الخاصة', descEn: 'Special meat dish with July unique spice blend' },

    // BURGER
    { sectionId: 'burgers', nameAr: 'اوريجينال بركر', nameEn: 'Original Burger', price: 7500, descAr: 'بركر لحم كلاسيكي مع الخس والطماطم والجبن', descEn: 'Classic beef burger with lettuce, tomato, and cheese' },
    { sectionId: 'burgers', nameAr: 'جولاي بركر (خس)', nameEn: 'July Lite Burger (Lettuce Wrap)', price: 7500, descAr: 'بركر خفيف مغلف بالخس بدل الخبز لمحبي الصحة', descEn: 'Lite burger wrapped in lettuce instead of bread for health enthusiasts' },
    { sectionId: 'burgers', nameAr: 'بركر المشروم و صلصة الرانش', nameEn: 'Mushroom & Ranch Burger', price: 8500, descAr: 'بركر لحم مع الفطر الطازج وصلصة الرانش الغنية', descEn: 'Beef burger with fresh mushrooms and rich ranch sauce' },
    { sectionId: 'burgers', nameAr: 'بركر الباينبل', nameEn: 'Pineapple Burger', price: 8500, descAr: 'مزيج رائع من اللحم المشوي مع شريحة أناناس طازجة', descEn: 'Great blend of grilled meat with a fresh pineapple slice' },
    { sectionId: 'burgers', nameAr: 'بركر البيض', nameEn: 'July Egg Burger', price: 9000, descAr: 'بركر لحم يعلوه بيض مقلي بلمسة جولاي', descEn: 'Beef burger topped with a sunny side up egg, July style' },
    { sectionId: 'burgers', nameAr: 'جولاي بركر', nameEn: 'July Burger', price: 10000, descAr: 'البركر الأضخم والمميز بمكونات جولاي السرية', descEn: 'The biggest and most special burger with July secret ingredients' },

    // SWEETS
    { sectionId: 'sweets', nameAr: 'اختيارك من العارضة', nameEn: 'Your Choice from Display', price: 0, descAr: 'يرجى اختيار نوع الحلويات المفضل لديك من عارضة العرض', descEn: 'Please choose your favorite sweet from the display' }
  ];

  console.log(`Starting bulk add of ${items.length} items...`);

  for (const item of items) {
    try {
      await adminUpsertItem(token, {
        type: 'food',
        sectionId: item.sectionId,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        price: item.price,
        descriptionAr: item.descAr,
        descriptionEn: item.descEn,
        imageUrl: ''
      });
      console.log(`Successfully added: ${item.nameEn}`);
    } catch (e) {
      console.error(`Failed to add ${item.nameEn}:`, e.message);
    }
  }

  console.log('Bulk add complete!');
}

window.bulkAddFood = bulkAddFood;
console.log('Bulk add tool ready. Run bulkAddFood() in console.');
