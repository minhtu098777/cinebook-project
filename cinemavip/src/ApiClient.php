<?php

namespace Cinebook;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class ApiClient
{
    private $client;
    private $baseUri = 'http://localhost:5000/api/'; // URL của backend Node.js

    public function __construct()
    {
        $this->client = new Client([
            'base_uri' => $this->baseUri,
            'timeout' => 10.0,
        ]);
    }

    // GET /api/movies - Lấy danh sách phim
    public function getMovies()
    {
        try {
            $response = $this->client->get('movies');
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // GET /api/movies/:id - Lấy chi tiết phim
    public function getMovie($id)
    {
        try {
            $response = $this->client->get("movies/{$id}");
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // POST /api/register - Đăng ký
    public function register($data)
    {
        try {
            $response = $this->client->post('register', [
                'json' => $data
            ]);
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // POST /api/login - Đăng nhập
    public function login($email, $password)
    {
        try {
            $response = $this->client->post('login', [
                'json' => ['email' => $email, 'password' => $password]
            ]);
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            return ['error' => $e->getMessage()];
        }
    }

    // POST /api/bookings - Đặt vé (cần token)
    public function bookTicket($data, $token)
    {
        try {
            $response = $this->client->post('bookings', [
                'json' => $data,
                'headers' => [
                    'Authorization' => "Bearer {$token}"
                ]
            ]);
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
