"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function viewOtherProfilePage() {
  const params = useParams();
  const router = useRouter();
  
  return (
    <p> Hello </p>
  );
}
