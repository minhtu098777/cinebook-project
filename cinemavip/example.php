<?php

require_once 'vendor/autoload.php';

use Cinebook\ApiClient;

// Khởi tạo client
$api = new ApiClient();

// Ví dụ 1: Lấy danh sách phim
echo "Danh sách phim:\n";
$movies = $api->getMovies();
if (isset($movies['error'])) {
    echo "Lỗi: " . $movies['error'] . "\n";
} else {
    foreach ($movies as $movie) {
        echo "- {$movie['title']} ({$movie['genre']})\n";
    }
}

// Ví dụ 2: Lấy chi tiết phim ID 1
echo "\nChi tiết phim ID 1:\n";
$movie = $api->getMovie(1);
if (isset($movie['error'])) {
    echo "Lỗi: " . $movie['error'] . "\n";
} else {
    echo "Title: {$movie['title']}\nDescription: {$movie['description']}\n";
}

// Ví dụ 3: Đăng ký người dùng
echo "\nĐăng ký:\n";
$registerData = [
    'name' => 'John Doe',
    'age' => 25,
    'city' => 'Hanoi',
    'language' => 'Vietnamese',
    'email' => 'john@example.com',
    'password' => 'password123'
];
$result = $api->register($registerData);
echo json_encode($result, JSON_PRETTY_PRINT) . "\n";

// Ví dụ 4: Đăng nhập
echo "\nĐăng nhập:\n";
$loginResult = $api->login('john@example.com', 'password123');
if (isset($loginResult['token'])) {
    $token = $loginResult['token'];
    echo "Token: {$token}\n";

    // Ví dụ 5: Đặt vé (cần token)
    echo "\nĐặt vé:\n";
    $bookingData = [
        'movieId' => 1,
        'seats' => 2,
        'date' => '2025-12-30',
        'time' => '20:00',
        'userId' => 1
    ];
    $bookingResult = $api->bookTicket($bookingData, $token);
    echo json_encode($bookingResult, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Lỗi đăng nhập: " . json_encode($loginResult) . "\n";
}
