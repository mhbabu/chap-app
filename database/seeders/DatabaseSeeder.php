<?php

namespace Database\Seeders;

use App\Models\Buyer;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name'      => 'System Admin',
            'email'     => 'admin@gmail.com',
            'password'  => bcrypt(12345678),
            'is_admin'  => true
        ]);

        User::factory()->create([
            'name'      => 'General User',
            'email'     => 'user@gmail.com',
            'password'  => bcrypt(12345678)
        ]);

        User::factory(10)->create();

        for ($i = 0; $i < 5; $i++) {
            $group = Group::factory()->create(['owner_id' => 1]);
            $user  = User::inRandomOrder()->limit(rand(2, 5))->pluck('id');
            $group->users()->attach(array_unique([1, ...$user]));
        }

        Message::factory(1000)->create();
        $messages = Message::whereNull('group_id')->orderBy('created_at')->get();

        $conversations = $messages->groupBy(function ($message) {
            $sortedIds = collect([$message->sender_id, $message->receiver_id])->sort();
            return $sortedIds->implode('_');
        })->map(function ($groupMessages) {
            return [
                'user_id1'        => $groupMessages->first()->sender_id,
                'user_id2'        => $groupMessages->first()->receiver_id,
                'last_message_id' => $groupMessages->last()->id,
                'created_at'      => new Carbon(),
                'updated_at'      => new Carbon(),
            ];
        })->values();


        Conversation::insertOrIgnore($conversations->toArray());

        Buyer::factory()->count(100)->create();
    }
}
