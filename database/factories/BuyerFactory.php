<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Buyer>
 */
class BuyerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = \App\Models\Buyer::class;

    public function definition(): array
    {
        $receipt_id = $this->faker->regexify('[A-Za-z0-9]{20}');
        $salt       = Str::random(20);
        $hash_key   = hash('sha512', $receipt_id . $salt);
        // Define the possible last digits
        static $lastTwoDigits = [
            '01', '02', '03', '05', '06', '07', '08', '09',
            '11', '12', '13', '15', '16', '17', '18', '19',
            '21', '22', '23', '25', '26', '27', '28', '29',
            '31', '32', '33', '35', '36', '37', '38', '39',
            '51', '52', '53', '55', '56', '57', '58', '59',
            '61', '62', '63', '65', '66', '67', '68', '69',
            '71', '72', '73', '75', '76', '77', '78', '79',
            '81', '82', '83', '85', '86', '87', '88', '89',
            '91', '92', '93', '95', '96', '97', '98', '99',
        ];
        // Ensure unique last two digits
        $uniqueSuffix = array_shift($lastTwoDigits);
        // Generate a name with less than 20 characters
        $buyer = $this->faker->name();
        if (strlen($buyer) > 20) {
            $buyer = substr($buyer, 0, 20);
        }
        return [
            'amount' => $this->faker->numberBetween(1, 10000),
            'buyer' => $buyer,
            'receipt_id' => $receipt_id,
            'items' => json_encode([$this->faker->word(), $this->faker->word()]),
            'buyer_email' => $this->faker->unique()->safeEmail,
            'buyer_ip' => $this->faker->ipv4,
            'note' => $this->faker->sentence(30),
            'city' => $this->faker->city,
            'phone' => '8801795232' . $uniqueSuffix,
            'hash_key' => $hash_key,
            'entry_at' => $this->faker->date(),
            'entry_by' => $this->faker->numberBetween(1, 10),
        ];
    }
}
