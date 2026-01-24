import { Debris } from '@rbxts/services';

/**
 * Applies a temporary vector force to a character model.
 * The force is automatically removed after 1.2 seconds.
 * 
 * @param character - The character model to apply force to
 * @param force - The force vector to apply (in world space)
 * @param attachment - Optional attachment point (defaults to RootRigAttachment)
 * @returns The created VectorForce instance
 */
export function addVectorForce(
    character: Model,
    force: Vector3,
    attachment?: Attachment
): VectorForce {
    warn('Adding vector force to character');
    
    const hrp = character.FindFirstChild('HumanoidRootPart', true);
    const forceAttachment = attachment || character.FindFirstChild('RootRigAttachment', true) as Attachment;
    
    const vectorForce = new Instance('VectorForce');
    vectorForce.Force = force;
    vectorForce.Enabled = true;
    vectorForce.Parent = hrp;
    vectorForce.Attachment0 = forceAttachment;
    vectorForce.RelativeTo = Enum.ActuatorRelativeTo.World;
    
    Debris.AddItem(vectorForce, 1.2);
    warn('Added vector force to character');
    
    return vectorForce;
}
