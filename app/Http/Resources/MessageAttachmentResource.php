<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MessageAttachmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'message_id'  => $this->message_id,
            'name'        => $this->name,
            'path'        => Storage::url($this->path),
            'mime'        => $this->mime,
            'size'        => $this->size,
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at
        ];
    }
}
